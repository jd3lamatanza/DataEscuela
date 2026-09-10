const config = {
  url: 'https://crsiykjmninfbietewpp.supabase.co',
  publishableKey: 'sb_publishable_HbYPCsrBmb4_q0H3p09eDg_uyFGsiFg'
};

const apiCard = document.querySelector('#apiCard');
const databaseCard = document.querySelector('#databaseCard');
const apiStatus = document.querySelector('#apiStatus');
const databaseStatus = document.querySelector('#databaseStatus');
const message = document.querySelector('#message');
const testButton = document.querySelector('#testButton');
document.querySelector('#projectUrl').textContent = config.url;

function setCard(card, statusElement, detailText, type) {
  card.className = `status-card ${type}`;
  statusElement.textContent = type === 'success' ? 'Conectada' : type === 'error' ? 'Error' : 'Pendiente';
  card.querySelector('p').textContent = detailText;
}

async function testConnection() {
  testButton.disabled = true;
  message.textContent = 'Consultando Supabase...';
  setCard(apiCard, apiStatus, 'Comprobando el endpoint público...', 'pending');
  setCard(databaseCard, databaseStatus, 'Consultando public.roles...', 'pending');

  try {
    const settingsResponse = await fetch(`${config.url}/auth/v1/settings`, { headers: { apikey: config.publishableKey } });
    if (!settingsResponse.ok) throw new Error(`API respondió HTTP ${settingsResponse.status}.`);
    setCard(apiCard, apiStatus, 'El proyecto responde correctamente.', 'success');

    const tableResponse = await fetch(`${config.url}/rest/v1/roles?select=uuid,slug,name&limit=20`, { headers: { apikey: config.publishableKey } });
    if (tableResponse.ok) {
      const rows = await tableResponse.json();
      setCard(databaseCard, databaseStatus, `public.roles existe y devolvió ${rows.length} registro(s).`, 'success');
      message.textContent = 'Conexión completa: API y base de datos disponibles.';
    } else if (tableResponse.status === 404) {
      setCard(databaseCard, databaseStatus, 'La API responde, pero public.roles todavía no existe.', 'error');
      message.textContent = 'Conexión a Supabase correcta. Falta crear el esquema DataEscuela.';
    } else if (tableResponse.status === 401 || tableResponse.status === 403) {
      setCard(databaseCard, databaseStatus, `La tabla existe o la API respondió, pero el acceso está bloqueado (HTTP ${tableResponse.status}).`, 'error');
      message.textContent = 'Revisá las políticas RLS y la clave pública.';
    } else {
      throw new Error(`Consulta de public.roles devolvió HTTP ${tableResponse.status}.`);
    }
  } catch (error) {
    if (apiCard.classList.contains('pending')) setCard(apiCard, apiStatus, error.message, 'error');
    if (databaseCard.classList.contains('pending')) setCard(databaseCard, databaseStatus, 'No se pudo consultar la base de datos.', 'error');
    message.textContent = `No se pudo completar la prueba: ${error.message}`;
  } finally {
    testButton.disabled = false;
  }
}

testButton.addEventListener('click', testConnection);
testConnection();
