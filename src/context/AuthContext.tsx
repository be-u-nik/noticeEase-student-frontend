import { createContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { openDB } from "idb";
import { Notice } from "../common/NoticeCard";
import { unsubscribeFromTopic } from "../utils/asyncMessagingUtils";

type Props = {
  children?: ReactNode;
};

interface StudentInfo {
  rollNumber: string;
  email: string;
  phoneNumber?: string;
  username: string;
  verified: boolean;
}

type IAuthContext = {
  isAuthenticated: boolean;
  setIsAuthenticated: (newState: boolean) => void;
  studentInfo: StudentInfo | null;
  handleLoginLocally: (studentInfo: StudentInfo) => void;
  handleLogoutLocally: () => void;
};

const initialValue = {
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  studentInfo: null,
  handleLoginLocally: () => {},
  handleLogoutLocally: () => {},
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: Props) => {
  //Initializing an auth state with false value (unauthenticated)
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthTokenFromCookie());
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthTokenFromCookie();
    if (token) {
      // Token found in cookies, set isAuthenticated to true and retrieve student info from IndexedDB
      setIsAuthenticated(true);
      getStudentInfoFromIndexedDB().then((info) => {
        if (info) {
          setStudentInfo(info);
        }
      });
    }
  }, []);

  const handleLoginLocally = (studentInfo: StudentInfo) => {
    storeStudentInfoInIndexedDB(studentInfo);
    setIsAuthenticated(true);
    setStudentInfo(studentInfo);
    navigate("/home");
  };

  const handleLogoutLocally = async () => {
    const fcmToken = await getFCMTokenFromIDB();
    if (fcmToken) unsubscribeFromTopic(fcmToken);
    setIsAuthenticated(false);
    setStudentInfo(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, studentInfo, handleLoginLocally, handleLogoutLocally }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function getAuthTokenFromCookie(): string | null {
  const studentAuthToken = document.cookie.split("; ").find((cookie) => cookie.startsWith("studentAuthToken="));

  return studentAuthToken ? studentAuthToken.split("=")[1] : null;
}

function storeAuthTokenInCookie(token: string): void {
  var expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  document.cookie = `studentAuthToken=${token}; path=/; expires=${expirationDate.toUTCString()}`;
}

function removeAuthTokenFromCookie(): void {
  document.cookie = "studentAuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

async function getFCMTokenFromIDB(): Promise<string | null> {
  const FIREBASE_MESSAGING_DB = "firebase-messaging-database";
  const FIREBASE_MESSAGING_STORE = "firebase-messaging-store";
  const db = await openDB(FIREBASE_MESSAGING_DB);
  const tx = db.transaction(FIREBASE_MESSAGING_STORE, "readonly");
  const t = await tx.store.getAll();
  return t[0].token;
}

const DB_NAME = "student-frontend";
const DB_VERSION = 1;
const STUDENT_INFO_STORE = "studentInfo";
const NOTICES_STORE = "notices";

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STUDENT_INFO_STORE);
      db.createObjectStore(NOTICES_STORE);
    },
  });
}

async function storeStudentInfoInIndexedDB(studentInfo: StudentInfo) {
  const db = await getDB();
  const tx = db.transaction(STUDENT_INFO_STORE, "readwrite");
  tx.store.put(studentInfo, "student");
  await tx.done;
}

async function getStudentInfoFromIndexedDB(): Promise<StudentInfo | null> {
  const db = await getDB();
  const tx = db.transaction(STUDENT_INFO_STORE, "readonly");
  return tx.store.get("student");
}

async function removeStudentInfoFromIndexedDB() {
  const db = await getDB();
  const tx = db.transaction(STUDENT_INFO_STORE, "readwrite");
  tx.store.delete("student");
  await tx.done;
}

async function storeNoticesInIndexedDB(notices: Notice[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(NOTICES_STORE, "readwrite");
  const store = tx.store;
  notices.reverse();
  for (const notice of notices) {
    const existingNotice = await store.get(notice._id);
    if (!existingNotice) {
      notice.isRead = false;
      store.put(notice, notice._id);
    }
  }

  await tx.done;
}

async function getNoticesFromIndexedDB(): Promise<Notice[]> {
  const db = await getDB();
  const tx = db.transaction(NOTICES_STORE, "readonly");
  const store = tx.store;

  const notices = await store.getAll();

  notices.sort((a, b) => a.customSno - b.customSno);

  return notices;
}

async function getNoticesLengthFromIndexedDB(): Promise<Number> {
  const db = await getDB();
  const tx = db.transaction(NOTICES_STORE, "readonly");
  const store = tx.store;

  const notices = await store.getAll();

  return notices.length;
}

async function removeNoticesFromIndexedDB(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(NOTICES_STORE, "readwrite");
  const store = tx.store;

  await store.clear();
  await tx.done;
}

async function markNoticeAsRead(_id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(NOTICES_STORE, "readwrite");
  const store = tx.store;

  const notice = await store.get(_id);
  if (notice) {
    notice.isRead = true;
    store.put(notice, _id);
  }

  await tx.done;
}

export {
  AuthContext,
  AuthProvider,
  getAuthTokenFromCookie,
  storeAuthTokenInCookie,
  removeAuthTokenFromCookie,
  storeStudentInfoInIndexedDB,
  getStudentInfoFromIndexedDB,
  removeStudentInfoFromIndexedDB,
  storeNoticesInIndexedDB,
  getNoticesFromIndexedDB,
  getNoticesLengthFromIndexedDB,
  removeNoticesFromIndexedDB,
  markNoticeAsRead,
  getFCMTokenFromIDB,
};
