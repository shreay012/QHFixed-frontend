'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import {
  removeFromCart,
  updateQuantity,
  selectCart,
} from '@/lib/redux/slices/cartSlice/cartSlice';
import { usePrice } from '@/lib/hooks/usePrice';

const CartItems = () => {
  const dispatch = useDispatch();
  const t = useTranslations('cart');
  const { items: cartItems, subtotal, tax, total } = useSelector(selectCart);
  const { format: fmtMoney } = usePrice();

  const handleRemoveItem = (id) => dispatch(removeFromCart(id));
  const handleQty = (id, quantity) => dispatch(updateQuantity({ id, quantity }));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('shoppingCart')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const itemId = item.id || item.serviceId;
              return (
                <div
                  key={itemId}
                  className="bg-white rounded-lg shadow-sm p-6 flex gap-6"
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    {item.duration && (
                      <p className="text-sm text-gray-600 mb-2">{item.duration}</p>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        type="button"
                        onClick={() => handleQty(itemId, (item.quantity || 1) - 1)}
                        className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        aria-label={t('decreaseQty')}
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center font-medium">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQty(itemId, (item.quantity || 1) + 1)}
                        className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        aria-label={t('increaseQty')}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xl font-bold text-[#45A735]">
                      {fmtMoney(Number(item.price * (item.quantity || 1)))}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(itemId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label={t('removeItem')}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('orderSummary')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal')}</span>
                  <span>{fmtMoney(Number(subtotal))}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('tax', { rate: 18 })}</span>
                  <span>{fmtMoney(Number(tax))}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                  <span>{t('total')}</span>
                  <span className="text-[#45A735]">{fmtMoney(Number(total))}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full px-6 py-3 bg-[#45A735] text-white text-center rounded-lg font-semibold hover:bg-[#3d9230] transition-colors mb-3"
              >
                {t('proceedCheckout')}
              </Link>

              <Link
                href="/book-your-resource"
                className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
