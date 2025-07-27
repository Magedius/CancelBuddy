export interface PopularService {
  name: string;
  logoColor: string;
  logoIcon?: string;
  logoText?: string;
  cancelUrl?: string;
  averagePrice?: number;
}

export const POPULAR_SERVICES: PopularService[] = [
  {
    name: "Netflix",
    logoColor: "bg-red-600",
    logoText: "N",
    cancelUrl: "https://www.netflix.com/cancelplan",
    averagePrice: 17.99,
  },
  {
    name: "Spotify",
    logoColor: "bg-green-500",
    logoText: "S",
    cancelUrl: "https://www.spotify.com/account/",
    averagePrice: 9.99,
  },
  {
    name: "Adobe Creative Cloud",
    logoColor: "bg-red-600",
    logoText: "Ai",
    cancelUrl: "https://account.adobe.com/",
    averagePrice: 24.19,
  },
  {
    name: "Disney+",
    logoColor: "bg-blue-600",
    logoText: "D+",
    cancelUrl: "https://www.disneyplus.com/account/",
    averagePrice: 8.99,
  },
  {
    name: "HBO Max",
    logoColor: "bg-purple-600",
    logoText: "H",
    cancelUrl: "https://www.max.com/account/",
    averagePrice: 9.99,
  },
  {
    name: "YouTube Premium",
    logoColor: "bg-red-500",
    logoText: "YT",
    cancelUrl: "https://www.youtube.com/account/",
    averagePrice: 11.99,
  },
  {
    name: "Microsoft 365",
    logoColor: "bg-blue-600",
    logoText: "M",
    cancelUrl: "https://account.microsoft.com/",
    averagePrice: 6.99,
  },
  {
    name: "Slack",
    logoColor: "bg-purple-600",
    logoText: "S",
    cancelUrl: "https://slack.com/account/",
    averagePrice: 6.67,
  },
  {
    name: "Zoom Pro",
    logoColor: "bg-blue-600",
    logoText: "Z",
    cancelUrl: "https://zoom.us/account/",
    averagePrice: 14.99,
  },
  {
    name: "Trello",
    logoColor: "bg-blue-500",
    logoText: "T",
    cancelUrl: "https://trello.com/account/",
    averagePrice: 5.00,
  },
  {
    name: "Evernote",
    logoColor: "bg-blue-700",
    logoText: "E",
    cancelUrl: "https://www.evernote.com/Settings.action",
    averagePrice: 7.99,
  },
  {
    name: "LinkedIn Premium",
    logoColor: "bg-blue-600",
    logoText: "Li",
    cancelUrl: "https://www.linkedin.com/psettings/",
    averagePrice: 29.99,
  },
  {
    name: "Canva Pro",
    logoColor: "bg-purple-500",
    logoText: "C",
    cancelUrl: "https://www.canva.com/settings/",
    averagePrice: 12.99,
  },
  {
    name: "Grammarly",
    logoColor: "bg-green-600",
    logoText: "G",
    cancelUrl: "https://account.grammarly.com/",
    averagePrice: 12.00,
  },
  {
    name: "Dropbox Plus",
    logoColor: "bg-blue-500",
    logoText: "D",
    cancelUrl: "https://www.dropbox.com/account/",
    averagePrice: 9.99,
  },
  {
    name: "GitHub Pro",
    logoColor: "bg-gray-900",
    logoText: "G",
    cancelUrl: "https://github.com/settings/",
    averagePrice: 4.00,
  },
  {
    name: "Figma Pro",
    logoColor: "bg-gray-800",
    logoText: "F",
    cancelUrl: "https://www.figma.com/settings/",
    averagePrice: 12.00,
  },
];
