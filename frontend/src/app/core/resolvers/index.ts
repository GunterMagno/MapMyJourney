/**
 * Barrel export para Core Resolvers
 * Simplifica los imports en app.routes.ts
 */

export { tripResolver, productResolver, type Trip, type Product } from './trip.resolver';
export { searchResolver, type SearchResult } from './search.resolver';


