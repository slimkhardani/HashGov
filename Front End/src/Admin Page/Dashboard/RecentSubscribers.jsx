import React, { useEffect, useState } from 'react';

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return "-";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const datePart = date.toLocaleDateString('en-US', options);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${datePart} - ${hours}:${mins}`;
}

export default function RecentSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/emails")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch subscribers");
        return res.json();
      })
      .then(data => {
        setSubscribers((data || []).sort((a, b) => new Date(b.subscriptionDate) - new Date(a.subscriptionDate)));
        setError("");
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{color:'#aaa',fontSize:14}}>Loading...</div>;
  if (error) return <div style={{color:'#ff4444',fontSize:14}}>Error: {error}</div>;
  if (!subscribers.length) return <div style={{color:'#aaa',fontSize:14}}>No subscribers found.</div>;

  return (
    <div style={{width:'100%',padding:0}}>
      <ul style={{listStyle:'none',margin:0,padding:0}}>
        {subscribers.slice(0,5).map(sub => (
          <li key={sub._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #23273b'}}>
            <span style={{color:'#fff',fontWeight:500,fontSize:'1rem'}}>{sub.email}</span>
            <span style={{color:'#9ba3af',fontSize:'0.95rem'}}>{formatDate(sub.subscriptionDate)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
