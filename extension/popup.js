document.getElementById("captureButton").addEventListener("click", async () => {
    const status = document.getElementById("status");
    status.textContent = "Capturing...";
  
    try {
      // Capture the visible tab
      const dataUrl = await chrome.tabs.captureVisibleTab();
  
      // Display a success message
      status.textContent = "Capture successful! Sending to server...";
  
      // Example: Sending the captured image to a server
      const response = await fetch("http://127.0.0.1:8000/api/process-image/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl })
      });
  
      if (response.ok) {
        status.textContent = "Image successfully sent to server!";
      } else {
        status.textContent = `Error: ${response.statusText}`;
      }
    } catch (error) {
      console.error(error);
      status.textContent = "Capture failed. Check the console for details.";
    }
  });
  