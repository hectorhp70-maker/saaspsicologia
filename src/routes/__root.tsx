import { Outlet, RootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Root = () => {
  return (
    <>
      <div className="min-h-screen bg-white">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
