import axios from '../axios/axiosInstance';
import { ENDPOINTS } from '../endpoints';

export const miscellaneousService = {
  contactUs: async (contactData) => {
    const payload = {
      name: contactData.name,
      email: contactData.email,
      phone_number: contactData.phone,
      organization: contactData.organization || "",
      description: contactData.description,
    };
    return await axios.post(ENDPOINTS.MISCELLANEOUS.CONTACT_US, payload);
  },
};
