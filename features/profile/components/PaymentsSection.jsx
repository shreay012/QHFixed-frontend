"use client";
import { showError, showSuccess } from '@/lib/utils/toast';

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from 'next-intl';
import { fetchPaymentHistory } from "@/lib/redux/slices/paymentSlice";
import { paymentService } from "@/lib/services/paymentApi";
import { Pagination } from "@/components/common";
import Image from "next/image";

const PaymentsSection = () => {
  const dispatch = useDispatch();
  const t = useTranslations('paymentsSection');
  const {
    history: payments,
    loading,
    error,
    totalPages,
    currentPage,
  } = useSelector((state) => state.payment);
  const [downloadingInvoices, setDownloadingInvoices] = useState({});

  useEffect(() => {
    dispatch(fetchPaymentHistory({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handlePageChange = (page) => {
    dispatch(fetchPaymentHistory({ page, limit: 10 }));
  };

  const currentPayments = payments;

  const handleDownloadInvoice = async (jobId) => {
    try {
      setDownloadingInvoices((prev) => ({ ...prev, [jobId]: true }));

      const response = await paymentService.downloadInvoice(jobId);

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${jobId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      showError(t('errorDownload'));
    } finally {
      setDownloadingInvoices((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    let bgColor = "bg-green-100";
    let textColor = "text-green-600";

    if (status === "failed") {
      bgColor = "bg-red-100";
      textColor = "text-red-500";
    } else if (status === "pending") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-600";
    }

    return (
      <span
        className={`${bgColor} ${textColor} px-3 py-1 rounded-full text-xs font-semibold inline-block`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-full lg:flex-1">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1
          className="font-[700] text-[18px] sm:text-[20px] lg:text-[24px]"
          style={{ color: "#202224" }}
        >
          {t('title')}
        </h1>
      </div>

      {/* Table Container - Responsive */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>{t('loading')}</p>
        </div>
      ) : error &&
        !error.includes("Cannot read properties of undefined") &&
        !error.includes("Failed to fetch payment history") ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : payments && payments.length > 0 ? (
        <>
          <div className="h-[540px] overflow-y-auto">
            <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-x-auto">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('booking')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('transaction')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('resource')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('dateTime')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('duration')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('price')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('status')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333]">
                        {t('action')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.map((payment, index) => (
                      <tr
                        key={payment.paymentId}
                        className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-[#F5F9FA]" : "bg-white"}`}
                      >
                        <td className="px-6 py-4 text-[12px] text-gray-900">
                          {payment.bookingId}
                        </td>
                        <td className="px-6 py-4 text-[12px] text-gray-600">
                          {payment.paymentId.split("_").pop()}
                        </td>
                        <td className="px-6 py-4 text-[12px] text-gray-900">
                          {payment.service}
                        </td>
                        <td className="px-6 py-4 text-[12px] text-gray-600">
                          {new Date(payment.initiatedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-[12px] text-gray-900">
                          {payment.duration} {t('hours')}
                        </td>
                        <td className="px-6 py-4 text-[12px] font-semibold text-green-600">
                          ₹{payment.amount}
                        </td>
                        <td className="px-6 py-4 text-[12px]">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 text-[12px]">
                          {payment.status !== "failed" && (
                            <button
                              onClick={() =>
                                handleDownloadInvoice(
                                  payment.jobId || payment._id,
                                )
                              }
                              disabled={
                                downloadingInvoices[
                                  payment.jobId || payment._id
                                ]
                              }
                              className="w-10 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingInvoices[
                                payment.jobId || payment._id
                              ] ? (
                                <svg
                                  className="animate-spin"
                                  width={20}
                                  height={20}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <svg
                                  width={20}
                                  height={20}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 2v12m0 0l-4-4m4 4l4-4"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M3 20h18"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Card View */}
              <div className="md:hidden p-4">
                <div className="space-y-4">
                  {currentPayments.map((payment) => (
                    <div
                      key={payment.paymentId}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              {t('bookingId')}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {payment.bookingId}
                            </p>
                          </div>
                          {payment.status !== "failed" && (
                            <button
                              onClick={() =>
                                handleDownloadInvoice(
                                  payment.jobId || payment._id,
                                )
                              }
                              disabled={
                                downloadingInvoices[
                                  payment.jobId || payment._id
                                ]
                              }
                              className="w-10 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingInvoices[
                                payment.jobId || payment._id
                              ] ? (
                                <svg
                                  className="animate-spin"
                                  width={20}
                                  height={20}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <svg
                                  width={20}
                                  height={20}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 2v12m0 0l-4-4m4 4l4-4"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M3 20h18"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              {t('transactionId')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {payment.paymentId.split("_").pop()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              {t('resource')}
                            </p>
                            <p className="text-sm text-gray-900">
                              {payment.service}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              {t('dateTime')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(payment.initiatedAt).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              {t('duration')}
                            </p>
                            <p className="text-sm text-gray-900">
                              {payment.duration} {t('hours')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              {t('price')}
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              ₹{payment.amount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              {t('status')}
                            </p>
                            <div>{getStatusBadge(payment.status)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination - Outside scrollable area */}
          {payments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hasNextPage={currentPage < totalPages}
              hasPrevPage={currentPage > 1}
            />
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg
              width={40}
              height={40}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                stroke="#9CA3AF"
                strokeWidth="2"
              />
              <path d="M2 10h20" stroke="#9CA3AF" strokeWidth="2" />
              <circle cx="18" cy="15" r="2" stroke="#9CA3AF" strokeWidth="2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {t('noPaymentRecords')}
          </h3>
          <p className="text-gray-500 font-opensauce text-center text-sm">
            {t('noPaymentDesc')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentsSection;
