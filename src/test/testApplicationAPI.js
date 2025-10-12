import axios from 'axios';

const API_BASE = 'http://localhost:3000/application'; // Adjust port if needed

// Test Apply for a Job
export async function testApplyJob() {
  try {
    const res = await axios.post(`${API_BASE}/apply`, {
      job_id: 'YOUR_JOB_ID',
      candidate_id: 'YOUR_CANDIDATE_ID',
      cv: 'https://example.com/cv.pdf' // optional
    });
    console.log('Apply Job:', res.data);
  } catch (err) {
    console.error('Apply Job Error:', err.response?.data || err.message);
  }
}

// Test View Application Status
export async function testViewApplicationStatus() {
  try {
    const candidate_id = 'YOUR_CANDIDATE_ID';
    const res = await axios.get(`${API_BASE}/status/${candidate_id}`);
    console.log('Application Status:', res.data);
  } catch (err) {
    console.error('View Status Error:', err.response?.data || err.message);
  }
}

// Test Import CV
export async function testImportCV() {
  try {
    const res = await axios.post(`${API_BASE}/cv/import`, {
      candidate_id: 'YOUR_CANDIDATE_ID',
      cv: 'https://example.com/newcv.pdf'
    });
    console.log('Import CV:', res.data);
  } catch (err) {
    console.error('Import CV Error:', err.response?.data || err.message);
  }
}

// Test Delete CV
export async function testDeleteCV() {
  try {
    const res = await axios.delete(`${API_BASE}/cv/delete`, {
      data: { candidate_id: 'YOUR_CANDIDATE_ID' }
    });
    console.log('Delete CV:', res.data);
  } catch (err) {
    console.error('Delete CV Error:', err.response?.data || err.message);
  }
}

// Example usage:
// (async () => {
//   await testApplyJob();
//   await testViewApplicationStatus();
//   await testImportCV();
//   await testDeleteCV();
// })();
