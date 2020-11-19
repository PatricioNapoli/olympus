import Home from "./views/Home"
import History from "./views/History"
import Profile from "./views/Profile";

class Route {
    constructor(path, link, name, icon, withLink, component) {
        this.path = path;
        this.link = link;
        this.name = name;
        this.icon = icon;
        this.withLink = withLink;
        this.component = component;
    }
}

export const routes = [
    new Route("/trading", "/trading", "Trading", "home", true, Home),
    new Route("/history", "/history", "History", "history", true, History),
    new Route("/profile", "/profile", "Profile", "user", true, Profile),
];

export const homeRoute = new Route("/", "/", "Trading", "home", true, Home);

export function getRoute(route) {
    if (route === "") {
        return homeRoute
    }

    for (let i = 0; i < routes.length; i++) {
        if (route === routes[i].name)
            return routes[i];
    }

    return "";
}
