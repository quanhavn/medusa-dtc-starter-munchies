// import { defineMiddlewares } from "@medusajs/medusa"
// import type {
//   MedusaRequest,
//   MedusaResponse,
//   MedusaNextFunction,
// } from "@medusajs/medusa"

// async function requestLogger(
//   req: MedusaRequest,
//   res: MedusaResponse, 
//   next: MedusaNextFunction
// ) {
//   // Log basic request info
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  
//   // Log request headers
//   console.log('Headers:', req.headers)

//   // Log request query parameters
//   if (Object.keys(req.query).length) {
//     console.log('Query:', req.query)
//   }

//   // Log request body for POST/PUT/PATCH requests
//   if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
//     console.log('Body:', req.body)
//   }

//   // Log request params
//   if (req.params && Object.keys(req.params).length) {
//     console.log('Params:', req.params)
//   }

//   next()
// }

// export default defineMiddlewares({
//   routes: [
//     {
//       matcher: /.*/, // Match all routes
//       middlewares: [requestLogger],
//     },
//   ],
// }) 