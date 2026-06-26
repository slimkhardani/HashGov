// Service for admin certificate demands (property-related & academic)
// Uses fetch API, returns JSON, and throws on error

const API_BASE = "/api/admin/certificatdemands";

export async function getPropertyRelatedDemands() {
  const res = await fetch(`${API_BASE}/property-related`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch property-related demands");
  return res.json();
}

export async function getAcademicDemands() {
  const res = await fetch(`${API_BASE}/academic`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch academic demands");
  return res.json();
}

// Delete a certificate demand by id
export async function deleteCertificateDemand(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete certificate demand');
  return res.json();
}

// Update certificate status (approve/reject)
export async function updateCertificateStatus(id, status) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error(`Failed to ${status} certificate request`);
  return res.json();
}
