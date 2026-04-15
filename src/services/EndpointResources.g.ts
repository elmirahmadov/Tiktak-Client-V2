export const API = {
	auth: {
		login: "/api/tiktak/auth/login",
		signup: "/api/tiktak/auth/signup",
		refresh: "/api/tiktak/auth/refresh",
		logout: "/api/tiktak/auth/logout",
	},
	client: {
		profile: "/api/tiktak/profile",
	},
	campaign: {
		list: "/api/tiktak/campaigns",
	},
	category: {
		list: "/api/tiktak/categories",
	},
	products: {
		basket: {
			get: "/api/tiktak/basket",
			add: (id: string | number) => `/api/tiktak/basket/${id}/add`,
			remove: (id: string | number) => `/api/tiktak/basket/${id}/remove`,
			removeAll: (id: string | number) => `/api/tiktak/basket/${id}/remove-all`,
		},
		list: "/api/tiktak/products",
	},
	order: {
		checkout: "/api/tiktak/order/checkout",
		list: "/api/tiktak/order/user",
		detail: (id: string | number) => `/api/tiktak/order/${id}`,
	},
};
