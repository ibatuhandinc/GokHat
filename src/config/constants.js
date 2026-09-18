'use strict';

/**
 * Uygulama geneli sabitler ve konfigürasyon değerleri.
 */
module.exports = {
  // Rezervasyon durumları
  BOOKING_STATUS: {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
  },

  // Uçuş durumları (ilerleyen aşamalar için)
  FLIGHT_STATUS: {
    SCHEDULED: 'scheduled',
    DELAYED: 'delayed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  // HTTP Durum Kodları
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_SERVER_ERROR: 500,
  },

  // PNR kodu uzunluğu (Passenger Name Record)
  PNR_LENGTH: 6,
};
