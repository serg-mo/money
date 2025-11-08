const API_BASE = '/api';

export async function fetchRules() {
  try {
    const response = await fetch(`${API_BASE}/rules`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rules = await response.json();
    return rules || {};
  } catch (error) {
    console.error('Error fetching rules:', error);
    return {};
  }
}

export async function saveRules(rules) {
  try {
    const response = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rules),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving rules:', error);
    return false;
  }
}
