import { useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { crawlPreviewEvents, deleteEvent, postEvent, togglePublishEvent } from '../../api/eventApi';

// Sự kiện Tiki: Admin xem trước / đăng / gỡ / xoá (chuyển nguyên từ Admin.jsx, không đổi hành vi)
export default function TikiEventsPanel() {
  const [isCrawling, setIsCrawling] = useState(false);

  const [previewEvents, setPreviewEvents] = useState([]);

  // Lỗi có response từ server → hiện message backend trả về; không có response → mất kết nối
  const handleCrawlEvents = async () => {
    setIsCrawling(true);
    try {
      setPreviewEvents(await crawlPreviewEvents());
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(`Error: ${getErrorMessage(error, 'Request failed')}`);
      } else {
        alert('Unable to connect to the backend server!');
      }
    } finally {
      setIsCrawling(false);
    }
  };

  const handlePostEvent = async (tikiEvent) => {
    try {
      // BE cào thử ngay sau khi đăng và báo số sản phẩm (0 = trang mã giảm giá / chưa mở bán → người dùng mở ra sẽ trống)
      const result = await postEvent(tikiEvent);
      alert(result?.productCount === 0 ? `⚠️ ${result.message}` : `🎉 ${result?.message ?? 'Event published successfully!'}`);
      // GỌI LẠI HÀM CRAWL ĐỂ LẤY EVENT ID MỚI NHẤT
      handleCrawlEvents();
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(`Error: ${getErrorMessage(error, 'Request failed')}`);
      }
    }
  };

  const handleTogglePublish = async (eventId) => {
    try {
      await togglePublishEvent(eventId);
      // CẬP NHẬT TRỰC TIẾP TRÊN RAM, KHÔNG CẦN TẢI LẠI TOÀN BỘ (SIÊU MƯỢT)
      setPreviewEvents(prev => prev.map(evt =>
        evt.eventId === eventId ? { ...evt, isPublished: !evt.isPublished } : evt
      ));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // 1. Hiển thị cảnh báo để tránh Admin ấn nhầm
    const isConfirm = window.confirm("Sự kiện này đã kết thúc trên Tiki. Bạn có chắc chắn muốn xóa nó khỏi hệ thống không?");
    if (!isConfirm) return;

    try {
      // 2. Gọi API Xóa
      await deleteEvent(eventId);
      // 3. Xóa thành công → gọi lại hàm Fetch Events để làm mới danh sách (hiệu ứng bốc hơi)
      handleCrawlEvents();
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(`Lỗi khi xóa: ${getErrorMessage(error, 'Không rõ nguyên nhân')}`);
      } else {
        alert('Network error: Không thể kết nối đến server!');
      }
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center bg-[#0f172a]/85 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
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

      <div className="bg-[#0f172a]/85 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
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
              // const dbInfo = dbEventsMap[evt.tikiEventId]; // Get this event's DB info
              const isSavedInDb = evt.eventId && evt.eventId !== "00000000-0000-0000-0000-000000000000";
              const isPublished = evt.isPublished === true;
              const isExpired = evt.isExpired === true;

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
                    {isExpired ? (
                      <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-600 text-slate-400 rounded-lg text-xs font-bold tracking-wide">EXPIRED</span>
                    ) : !isSavedInDb ? (
                      <span className="px-3 py-1.5 bg-cyan-900/40 border border-cyan-800 text-cyan-400 rounded-lg text-xs font-bold tracking-wide">PENDING REVIEW</span>
                    ) : isPublished ? (
                      <span className="px-3 py-1.5 bg-emerald-900/40 border border-emerald-800 text-emerald-400 rounded-lg text-xs font-bold tracking-wide">LIVE</span>
                    ) : (
                      <span className="px-3 py-1.5 bg-rose-900/40 border border-rose-800 text-rose-400 rounded-lg text-xs font-bold tracking-wide line-through">HIDDEN</span>
                    )}
                    {/* Số sản phẩm cào được gần nhất (null = chưa cào) – 0 thì người dùng mở sự kiện sẽ thấy trống */}
                    {!isExpired && evt.liveProductCount === 0 && (
                      <span className="mt-2 block text-[11px] font-bold tracking-wide text-amber-400" title="Trang này hiện không có sản phẩm (trang mã giảm giá hoặc chưa mở bán)">
                        ⚠ NO PRODUCTS
                      </span>
                    )}
                    {!isExpired && evt.liveProductCount > 0 && (
                      <span className="mt-2 block text-[11px] text-slate-400">{evt.liveProductCount} products</span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {isExpired ? (
                      <button
                        onClick={() => handleDeleteEvent(evt.eventId)}
                        className="px-5 py-2 rounded-lg font-bold text-xs tracking-wider transition-all duration-300 border bg-slate-800/50 text-slate-400 border-slate-600 hover:bg-rose-900/60 hover:text-rose-400 hover:border-rose-800 shadow-sm"
                      >
                        DELETE
                      </button>
                    ) : !isSavedInDb ? (
                      <button
                        onClick={() => handlePostEvent(evt)}
                        className="px-5 py-2 rounded-lg font-bold text-xs tracking-wider transition-all duration-300 border bg-cyan-900/30 text-cyan-400 border-cyan-800 hover:bg-cyan-900/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      >
                        PUBLISH NOW
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTogglePublish(evt.eventId)}
                        className={`px-5 py-2 rounded-lg font-bold text-xs tracking-wider transition-all duration-300 border ${isPublished
                          ? 'bg-rose-900/30 text-rose-400 border-rose-800 hover:bg-rose-900/60 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                          : 'bg-emerald-900/30 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
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
  );
}
