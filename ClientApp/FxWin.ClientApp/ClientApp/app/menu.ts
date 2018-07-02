const Home = {
    text: 'Home',
    link: '/home',
    icon: 'icon-home'
};
const Dashboard = {
    text: 'Dashboard',
    link: '/dashboard',
    icon: 'icon-home'
};
const ImportExport = {
    text: 'Import/Export',
    link: '/ImportExport',
    icon: 'icon-chemistry',
    submenu: [
        {
            text: 'Import Signal',
            link: '/elements/buttons'
        },
        {
            text: 'Valuation by STORM',
            link: '/elements/interaction'
        },
        {
            text: 'Export POMAX',
            link: '/elements/notification'
        }
    ]
};
const Price = {
    text: 'Price',
    link: '/price',
    icon: 'fa fa-money'
};
const Hedge = {
    text: 'Hedge',
    link: '/hedge',
    icon: 'fa fa-yelp'
};
const SignalContracts = {
    text: 'Signal contracts',
    link: '/signalContract',
    icon: 'icon-layers'
};
const Cargo = {
    text: 'Cargo',
    link: '/cargo',
    icon: 'fa fa-ship'
};
const CommodityHedge = {
    text: 'Commodity Hedge',
    link: '/CommodityHedge',
    icon: 'fa fa-google-wallet'
};
const FXWINcontracts = {
    text: 'FX-WIN contracts',
    link: '/FxWinContract',
    icon: 'icon-notebook'
};
const Underlying = {
    text: 'Underlying',
    link: '/underlying',
    icon: 'icon-book-open'
};

const HedgeReport = {
    text: 'Reporting',
    link: '/HedgeReport',
    icon: 'icon-chart'
};

const CubeView = {
    text: 'cube view',
    link: '/cubeview',
    icon: 'fa fa-cube'
};

const CubeHedge = {
    text: 'Cube FXhedge',
    link: '/cubehedge',
    icon: 'fa fa-database'
};
const CubeCommodities = {
    text: 'Cube Commodities',
    link: '/CubeCommodities',
    icon: 'fa fa-line-chart'
};
const SummaryReport = {
    text: 'Summary',
    link: '/summary',
    icon: 'fa fa-signal'
};
const StormMatching = {
    text: 'Storm Matching',
    link: '/StormMatching',
    icon: 'icon-settings'
};
const headingMain = {
    text: 'Main Menu',
    heading: true
};
const headingReporting = {
    text: 'Reporting',
    heading: true
};
const headingSettings = {
    text: 'Settings',
    heading: true
};
export const menu = [
    headingMain,
    Home,
    //Dashboard,
    //ImportExport,
    Price,
    Hedge,
    SignalContracts,
    Cargo,
    //CommodityHedge,
    FXWINcontracts,
    Underlying,
    
    headingReporting,
    HedgeReport,
    CubeView,
    CubeHedge,
    CubeCommodities,
    SummaryReport,
    
    //headingSettings,
    //StormMatching
];
