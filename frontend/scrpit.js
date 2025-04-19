document.getElementById('saludoBtn').addEventListener('click', async () => {
    const response = await fetch('/api/saludo');
    const data = await response.json();
    document.getElementById('mensaje').textContent = data.mensaje;
  });