import { useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { crawlPreviewEvents, deleteEvent, postEvent, togglePublishEvent } from '../../api/eventApi';
import { RefreshCw } from 'lucide-react';
import { LoadingRow, PANEL, Pill } from './ui';

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

      <div className={`${PANEL} flex flex-wrap justify-between items-center gap-4 p-6`}>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Sync events from Tiki</h3>
          <p className="text-sm text-slate-500 mt-0.5">Scan the latest promotional campaigns on the Tiki homepage, then publish the ones you want.</p>
        </div>

        <button
          onClick={handleCrawlEvents}
          disabled={isCrawling}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={isCrawling ? 'animate-spin' : ''} aria-hidden="true" />
          {isCrawling ? 'Fetching events…' : 'Fetch events'}
        </button>
      </div>

      <div className={`${PANEL} overflow-hidden`}>
        {previewEvents.length === 0 ? (
          <LoadingRow text={isCrawling ? 'Fetching events from Tiki…' : 'Fetch events to review and publish Tiki campaigns.'} />
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="px-5 py-3 font-medium">Image</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
                <th className="px-5 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {previewEvents.map((evt, idx) => {
                const isSavedInDb = evt.eventId && evt.eventId !== "00000000-0000-0000-0000-000000000000";
                const isPublished = evt.isPublished === true;
                const isExpired = evt.isExpired === true;

                return (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-900 font-medium mb-1">{evt.title}</p>
                      <a href={evt.eventLink} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline text-xs truncate block max-w-xs">
                        {evt.eventLink}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {isExpired ? <Pill>Expired</Pill>
                        : !isSavedInDb ? <Pill tone="info">Pending review</Pill>
                        : isPublished ? <Pill tone="good">Live</Pill>
                        : <Pill tone="bad">Hidden</Pill>}
                      {/* Số sản phẩm cào được gần nhất (null = chưa cào) – 0 thì người dùng mở sự kiện sẽ thấy trống */}
                      {!isExpired && evt.liveProductCount === 0 && (
                        <span className="mt-2 block text-xs font-medium text-amber-800" title="Trang này hiện không có sản phẩm (trang mã giảm giá hoặc chưa mở bán)">
                          No products
                        </span>
                      )}
                      {!isExpired && evt.liveProductCount > 0 && (
                        <span className="mt-2 block text-xs text-slate-500">{evt.liveProductCount} products</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {isExpired ? (
                        <button onClick={() => handleDeleteEvent(evt.eventId)}
                          className="px-3.5 py-1.5 rounded-lg text-sm font-medium border border-rose-200 text-rose-700 hover:bg-rose-50">
                          Delete
                        </button>
                      ) : !isSavedInDb ? (
                        <button onClick={() => handlePostEvent(evt)}
                          className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600">
                          Publish
                        </button>
                      ) : (
                        <button onClick={() => handleTogglePublish(evt.eventId)}
                          className="px-3.5 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50">
                          {isPublished ? 'Unpublish' : 'Republish'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
