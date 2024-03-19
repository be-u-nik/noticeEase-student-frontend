export async function subscribeToTopic(token: string, rollNumber: string) {
  try {
    const subscribeResponse = await fetch(`${import.meta.env.VITE_ERPSCRAPPER_BASE_URL}/api/messaging/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, rollNumber }),
    });

    if (!subscribeResponse.ok) {
      const error = await subscribeResponse.json();
      throw new Error(error.error);
    }
    console.log(await subscribeResponse.json());
  } catch (error) {
    console.error("Error during notice subscription", error);
    throw error;
  }
}

export async function unsubscribeFromTopic(token: string) {
  try {
    const unsubscribeResponse = await fetch(`${import.meta.env.VITE_ERPSCRAPPER_BASE_URL}/api/messaging/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!unsubscribeResponse.ok) {
      const error = await unsubscribeResponse.json();
      throw new Error(error.error);
    }
    console.log(await unsubscribeResponse.json());
  } catch (error) {
    console.error("Error during notice unsubscription", error);
    throw error;
  }
}
