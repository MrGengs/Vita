// VITA — ESP32-CAM Service (stub)
const VitaESP32 = (() => {
  function setIP(ip) { VitaStore.set('esp32IP', ip); localStorage.setItem('vita_esp32_ip', ip); }
  function getIP() { return VitaStore.get('esp32IP') || localStorage.getItem('vita_esp32_ip') || ''; }
  function getStreamURL(ip) { return `http://${ip}/stream`; }
  function getCaptureURL(ip) { return `http://${ip}/capture`; }

  async function testConnection(ip) {
    try {
      await fetch(`http://${ip}/`, { mode: 'no-cors', signal: AbortSignal.timeout(3000) });
      return true;
    } catch { return false; }
  }

  return { setIP, getIP, getStreamURL, getCaptureURL, testConnection };
})();
