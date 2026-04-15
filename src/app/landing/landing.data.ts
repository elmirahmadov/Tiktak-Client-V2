export type HeroCard = {
	title: string;
	subtitle: string;
	badge: string;
	cta: string;
	tone: "green" | "red";
};

export type PromoCard = {
	title: string;
	subtitle: string;
	tone: "dark" | "festive";
};

export type Metric = {
	value: string;
	label: string;
};

export type FooterColumn = {
	title: string;
	links: string[];
};

export type SocialLink = {
	label: string;
	short: string;
};

export const heroCards: HeroCard[] = [
	{
		title: "Bravo Club",
		subtitle: "Alis-verisde yeni heyecan!",
		badge: "*",
		cta: "Daha etrafli",
		tone: "green",
	},
	{
		title: "Bravo-da Yenili endirimler",
		subtitle: "20 dekabr",
		badge: "*",
		cta: "Daha etrafli",
		tone: "red",
	},
];

export const promoCards: PromoCard[] = [
	{
		title: "Qeyri-adiya endirimli",
		subtitle: "12 dekabr - 8 yanvar",
		tone: "dark",
	},
	{
		title: "Bravo-da Yenilendirmlar",
		subtitle: "24 dekabr 2024 - 8 yanvar 2025",
		tone: "festive",
	},
];

export const metrics: Metric[] = [
	{ value: "137", label: "Market sayı" },
	{ value: "11", label: "Region" },
	{ value: "50000+", label: "Məhsul sayı" },
	{ value: "5500+", label: "Əməkdaş sayı" },
];

export const footerColumns: FooterColumn[] = [
	{
		title: "Şirkət",
		links: ["Xususi təkliflər", "Haqqımızda", "Kartlar", "İcarəyə verməyə yeriniz var?"],
	},
	{
		title: "Digər",
		links: ["Xəbərlər", "Karyera", "Marketlərimiz", "Müştəri xidmətləri"],
	},
	{
		title: "Hüquq",
		links: ["İstifadə şərtləri", "Imtina", "Onlayn market", "Korporativ satış"],
	},
];

export const footerNewsletterTitle = "Yeniliklərə abunə olun";

export const footerMeta = {
	copyright: "© 2025 Azerbaijan Supermarket. Bütün hüquqlar qorunur",
	siteByLabel: "Site by",
	siteByName: "JIS",
locale: "Azərbaycan",
};

export const socialLinks: SocialLink[] = [
	{ label: "Facebook", short: "f" },
	{ label: "Instagram", short: "ig" },
	{ label: "YouTube", short: "yt" },
	{ label: "LinkedIn", short: "in" },
	{ label: "Telegram", short: "tg" },
	{ label: "TikTok", short: "tt" },
	{ label: "WhatsApp", short: "wa" },
];
