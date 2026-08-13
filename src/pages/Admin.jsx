import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://localhost:44338';

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('events');
  const [isCrawling, setIsCrawling] = useState(false);

  const [previewEvents, setPreviewEvents] = useState([]);

  // STORE THE FULL STATE FROM THE DATABASE AS AN OBJECT
  // e.g.: { 120547: { eventId: '...', isPublished: true } }
  const [dbEventsMap, setDbEventsMap] = useState({});

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'events', label: 'Event Management (Tiki)' },
    { id: 'tracking', label: 'Tracked Products' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'System Settings' },
  ];

  const getToken = () => localStorage.getItem('token');

  // ADMIN-ONLY API CALL (fetches both hidden and visible events)
  const fetchDbEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Event/getAllEventsAdmin`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        const map = {};
        data.forEach(evt => {
          map[evt.tikiEventId] = { eventId: evt.eventId, isPublished: evt.isPublished };
        });
        setDbEventsMap(map);
      }
    } catch (error) {
      console.error('Error fetching DB events:', error);
    }
  };

  useEffect(() => {
    if (activeMenu === 'events') {
      fetchDbEvents();
    }
  }, [activeMenu]);

  const handleCrawlEvents = async () => {
    setIsCrawling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Event/crawlPreview`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewEvents(data);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the backend server!');
    } finally {
      setIsCrawling(false);
    }
  };

  const handlePostEvent = async (tikiEvent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Event/postEvent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(tikiEvent)
      });

      if (response.ok) {
        alert('🎉 Event published successfully!');
        fetchDbEvents(); // Reload to switch the button to "UNPUBLISH"
      } else {
        // Read the error returned by the backend
        if (response.status === 403) {
          alert('Error 403: You do not have permission to publish this event!');
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Network error: Unable to connect to the server while publishing the event!');
    }
  };

  // NEW FUNCTION: HIDE / SHOW EVENT (Toggle Publish)
  const handleTogglePublish = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Event/togglePublish/${eventId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (response.ok) {
        const data = await response.json();
        // On success, reload the list
        fetchDbEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* ... Style, Sidebar, Background Video sections stay the same ... */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      <div className="fixed inset-0 w-full h-full z-0 bg-[#0f172a]">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-40">
          <source src="/theme.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/80 to-[#0f172a]/95 w-full h-full"></div>
      </div>

      <div className="relative z-10 flex h-screen font-sans text-slate-200">

        {/* ... Paste your Aside Sidebar section here ... */}
        <aside className="w-72 flex flex-col bg-[#0f172a]/60 backdrop-blur-xl border-r border-slate-700/50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-slate-700/50">
            <h1 className="text-3xl font-urbanist font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 drop-shadow-md">ePriTracker</h1>
            <p className="text-xs font-syne text-slate-400 mt-2 uppercase tracking-widest">Admin Panel</p>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 font-syne font-medium ${activeMenu === item.id ? 'bg-slate-800/80 text-white border border-slate-600/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] translate-x-1' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 hover:translate-x-1'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-urbanist font-bold text-white drop-shadow-sm">{menuItems.find(m => m.id === activeMenu)?.label}</h2>
            </div>
          </header>

          {activeMenu === 'events' && (
            <div className="space-y-6">

              <div className="flex justify-between items-center bg-[#0f172a]/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                <div>
                  <h3 className="text-xl font-urbanist font-bold text-white">Sync Events from Tiki</h3>
                  <p className="text-sm font-syne text-slate-400 mt-1">Scan the latest promotional campaigns on the homepage.</p>
                </div>

                <button
                  onClick={handleCrawlEvents}
                  disabled={isCrawling}
                  className={`relative group inline-block overflow-hidden rounded-xl px-8 py-3 text-sm font-bold text-white transition-all duration-300 ${isCrawling ? 'bg-slate-700 cursor-not-allowed opacity-70' : 'bg-orange-500 hover:bg-orange-600 hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                    }`}
                >
                  <span className="relative font-syne z-10">{isCrawling ? 'FETCHING EVENTS...' : 'FETCH EVENTS'}</span>
                </button>
              </div>

              <div className="bg-[#0f172a]/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/60 text-slate-300 text-sm font-syne border-b border-slate-700/50">
                      <th className="p-5 font-semibold">Image</th>
                      <th className="p-5 font-semibold">Event Name</th>
                      <th className="p-5 font-semibold text-center">Status</th>
                      <th className="p-5 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-syne">
                    {previewEvents.map((evt, idx) => {

                      // STATUS DISPLAY LOGIC
                      const dbInfo = dbEventsMap[evt.tikiEventId]; // Get this event's DB info
                      const isSavedInDb = !!dbInfo; // Has it already been saved to the DB?
                      const isPublished = isSavedInDb && dbInfo.isPublished; // Is it currently visible?

                      return (
                        <tr key={idx} className="border-b border-slate-700/30 hover:bg-white/5 transition-colors duration-200">
                          <td className="p-5">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-600/50">
                              <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-5">
                            <p className="text-white font-medium text-base mb-1">{evt.title}</p>
                            <a href={evt.eventLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline text-xs truncate block max-w-xs transition-colors">
                              {evt.eventLink}
                            </a>
                          </td>
                          <td className="p-5 text-center">
                            {/* STATUS DISPLAY */}
                            {!isSavedInDb && (
                              <span className="px-3 py-1.5 bg-cyan-900/40 border border-cyan-800 text-cyan-400 rounded-lg text-xs font-bold tracking-wide">PENDING REVIEW</span>
                            )}
                            {isSavedInDb && isPublished && (
                              <span className="px-3 py-1.5 bg-emerald-900/40 border border-emerald-800 text-emerald-400 rounded-lg text-xs font-bold tracking-wide">LIVE</span>
                            )}
                            {isSavedInDb && !isPublished && (
                              <span className="px-3 py-1.5 bg-rose-900/40 border border-rose-800 text-rose-400 rounded-lg text-xs font-bold tracking-wide line-through">HIDDEN</span>
                            )}
                          </td>
                          <td className="p-5 text-center">
                            {/* BUTTON MATCHING THE CURRENT STATUS */}
                            {!isSavedInDb ? (
                              <button
                                onClick={() => handlePostEvent(evt)}
                                className="px-5 py-2 rounded-lg font-bold text-xs tracking-wider transition-all duration-300 border bg-cyan-900/30 text-cyan-400 border-cyan-800 hover:bg-cyan-900/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                              >
                                PUBLISH NOW
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTogglePublish(dbInfo.eventId)}
                                className={`px-5 py-2 rounded-lg font-bold text-xs tracking-wider transition-all duration-300 border ${isPublished
                                  ? 'bg-rose-900/30 text-rose-400 border-rose-800 hover:bg-rose-900/60'
                                  : 'bg-emerald-900/30 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                                  }`}
                              >
                                {isPublished ? 'UNPUBLISH' : 'REPUBLISH'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}