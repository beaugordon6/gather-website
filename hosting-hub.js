function goPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ---- Fetch profile and personalise ----
var SUPABASE_URL = "http://192.168.1.237:54321";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

(async function() {
  var params = new URLSearchParams(window.location.search);
  var uuid = params.get("uuid");

  // Save UUID to localStorage if present in URL
  if (uuid) localStorage.setItem("gather_host_uuid", uuid);
  else uuid = localStorage.getItem("gather_host_uuid");

  if (!uuid) return;

  // Show cached name immediately, then refresh from API
  var el = document.getElementById("hub-welcome-name");
  var cached = localStorage.getItem("gather_host_name");
  if (el && cached) el.textContent = cached;

  try {
    var res = await fetch(
      SUPABASE_URL + "/rest/v1/profiles?uuid=eq." + uuid + "&select=name",
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + SUPABASE_ANON_KEY
        }
      }
    );
    var data = await res.json();
    if (data && data[0] && data[0].name) {
      localStorage.setItem("gather_host_name", data[0].name);
      if (el) el.textContent = data[0].name;
    }
  } catch (err) {
    console.error("Failed to fetch profile:", err);
  }
})();
