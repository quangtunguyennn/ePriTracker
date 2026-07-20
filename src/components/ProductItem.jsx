export default function ProductItem(props) {
  const productName = props.productName;
  const productImage = props.image;
  const productDesc = props.desc;
  const initialProductPrice = props.initialPrice;

  return (
    <>
      <article className=" shadow-lg w-1/3 p-4">
        <img src={productImage} alt="" />
        <div>
          <p className="font-syne font-semibold text-xl">{productName}</p>
          <p className="font-urbanist text-lg">{productDesc}</p>
          <p className="font-syne text-3xl font-medium text-red-900">
            {initialProductPrice}
          </p>
        </div>
      </article>
    </>
  );
}
