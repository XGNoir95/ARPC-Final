import { createContext, useContext } from "react";

export const RouteTransitionContext = createContext({
  prevPathname: null,
  currentPathname: null,
});

export const useRouteTransition = () => useContext(RouteTransitionContext);
