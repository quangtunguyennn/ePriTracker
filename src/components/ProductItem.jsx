export default function ProductItem(props) {
  const { productName, image, desc, initialPrice } = props;

  return (
    // Sửa w-1/3 thành w-full, thêm h-full để các thẻ cao bằng nhau
    <article className="shadow-lg w-full h-full p-4 bg-white rounded-lg transition-transform hover:scale-105">
      <img 
        src={image} 
        alt={productName} 
        className="w-full  object-cover rounded-md" // Giới hạn chiều cao ảnh để tránh lệch
      />
      <div className="mt-4 flex flex-col justify-between h-auto">
        <div>
          <p className="font-syne font-semibold text-xl">{productName}</p>
          <p className="font-urbanist text-lg text-gray-600 line-clamp-2">{desc}</p>
        </div>
        <p className="font-syne text-3xl font-medium text-red-900 mt-2">
          {initialPrice}
        </p>
      </div>
    </article>
  );
}