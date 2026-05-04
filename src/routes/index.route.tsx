import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root.route'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

function Index() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🧠 PsiWell
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Plataforma de Psicologia e Bem-estar
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
          <p className="text-gray-600 mb-6">
            Bem-vindo à sua plataforma de serviços psicológicos
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
            Começar
          </button>
        </div>
      </div>
    </div>
  )
}
