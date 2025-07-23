import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SearchQuery {
  district?: string
  dong_name?: string
  apartment_name?: string
  min_price?: number
  max_price?: number
  min_area?: number
  max_area?: number
  construction_year_start?: number
  construction_year_end?: number
  min_floor?: number
  max_floor?: number
  sort_by?: 'price' | 'date' | 'area' | 'price_per_sqm'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function searchRoutes (fastify: FastifyInstance) {
  // Advanced apartment search with filters
  fastify.get<{ Querystring: SearchQuery }>('/api/search/apartments', async (request, reply) => {
    try {
      const {
        district,
        dong_name,
        apartment_name,
        min_price,
        max_price,
        min_area,
        max_area,
        construction_year_start,
        construction_year_end,
        min_floor,
        max_floor,
        sort_by = 'date',
        sort_order = 'desc',
        page = 1,
        limit = 20
      } = request.query

      // Build dynamic search query
      const whereConditions: any = {
        data_quality_score: { gte: 80 } // Only high-quality data
      }

      if (district) {
        whereConditions.district_name = { contains: district, mode: 'insensitive' }
      }
      if (dong_name) {
        whereConditions.dong_name = { contains: dong_name, mode: 'insensitive' }
      }
      if (apartment_name) {
        whereConditions.apartment_name = { contains: apartment_name, mode: 'insensitive' }
      }
      if (min_price || max_price) {
        whereConditions.transaction_amount_won = {}
        if (min_price) whereConditions.transaction_amount_won.gte = min_price * 10000 // Convert 만원 to won
        if (max_price) whereConditions.transaction_amount_won.lte = max_price * 10000
      }
      if (min_area || max_area) {
        whereConditions.area_sqm = {}
        if (min_area) whereConditions.area_sqm.gte = min_area
        if (max_area) whereConditions.area_sqm.lte = max_area
      }
      if (construction_year_start || construction_year_end) {
        whereConditions.construction_year = {}
        if (construction_year_start) whereConditions.construction_year.gte = construction_year_start
        if (construction_year_end) whereConditions.construction_year.lte = construction_year_end
      }
      if (min_floor || max_floor) {
        whereConditions.floor = {}
        if (min_floor) whereConditions.floor.gte = min_floor
        if (max_floor) whereConditions.floor.lte = max_floor
      }

      // Build sort options
      const orderBy: any = {}
      switch (sort_by) {
        case 'price':
          orderBy.transaction_amount_won = sort_order
          break
        case 'area':
          orderBy.area_sqm = sort_order
          break
        case 'price_per_sqm':
          orderBy.price_per_sqm = sort_order
          break
        case 'date':
        default:
          orderBy.transaction_date = sort_order
          break
      }

      // Execute search query with raw SQL for better performance
      const offset = (page - 1) * limit
      
      const searchQuery = `
        SELECT 
          unique_key,
          district_name,
          dong_name,
          apartment_name,
          transaction_amount_won,
          transaction_amount_display,
          area_sqm,
          area_pyeong,
          construction_year,
          floor,
          transaction_date,
          price_per_sqm,
          data_quality_score
        FROM apartment_transactions 
        WHERE data_quality_score >= 80
        ${district ? `AND district_name ILIKE '%${district}%'` : ''}
        ${dong_name ? `AND dong_name ILIKE '%${dong_name}%'` : ''}
        ${apartment_name ? `AND apartment_name ILIKE '%${apartment_name}%'` : ''}
        ${min_price ? `AND transaction_amount_won >= ${min_price * 10000}` : ''}
        ${max_price ? `AND transaction_amount_won <= ${max_price * 10000}` : ''}
        ${min_area ? `AND area_sqm >= ${min_area}` : ''}
        ${max_area ? `AND area_sqm <= ${max_area}` : ''}
        ${construction_year_start ? `AND construction_year >= ${construction_year_start}` : ''}
        ${construction_year_end ? `AND construction_year <= ${construction_year_end}` : ''}
        ${min_floor ? `AND floor >= ${min_floor}` : ''}
        ${max_floor ? `AND floor <= ${max_floor}` : ''}
        ORDER BY ${sort_by === 'price' ? 'transaction_amount_won' : 
                  sort_by === 'area' ? 'area_sqm' : 
                  sort_by === 'price_per_sqm' ? 'price_per_sqm' : 'transaction_date'} ${sort_order.toUpperCase()}
        LIMIT ${limit} OFFSET ${offset}
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM apartment_transactions 
        WHERE data_quality_score >= 80
        ${district ? `AND district_name ILIKE '%${district}%'` : ''}
        ${dong_name ? `AND dong_name ILIKE '%${dong_name}%'` : ''}
        ${apartment_name ? `AND apartment_name ILIKE '%${apartment_name}%'` : ''}
        ${min_price ? `AND transaction_amount_won >= ${min_price * 10000}` : ''}
        ${max_price ? `AND transaction_amount_won <= ${max_price * 10000}` : ''}
        ${min_area ? `AND area_sqm >= ${min_area}` : ''}
        ${max_area ? `AND area_sqm <= ${max_area}` : ''}
        ${construction_year_start ? `AND construction_year >= ${construction_year_start}` : ''}
        ${construction_year_end ? `AND construction_year <= ${construction_year_end}` : ''}
        ${min_floor ? `AND floor >= ${min_floor}` : ''}
        ${max_floor ? `AND floor <= ${max_floor}` : ''}
      `

      const [results, countResult] = await Promise.all([
        prisma.$queryRawUnsafe(searchQuery),
        prisma.$queryRawUnsafe(countQuery)
      ])

      const total = Number((countResult as any)[0].total)
      const totalPages = Math.ceil(total / limit)

      // Get aggregated statistics
      const statsQuery = `
        SELECT 
          AVG(transaction_amount_won)::bigint as avg_price,
          MIN(transaction_amount_won)::bigint as min_price,
          MAX(transaction_amount_won)::bigint as max_price,
          AVG(area_sqm)::numeric as avg_area,
          AVG(price_per_sqm)::int as avg_price_per_sqm,
          COUNT(DISTINCT district_name) as district_count,
          COUNT(DISTINCT apartment_name) as apartment_count
        FROM apartment_transactions 
        WHERE data_quality_score >= 80
        ${district ? `AND district_name ILIKE '%${district}%'` : ''}
        ${dong_name ? `AND dong_name ILIKE '%${dong_name}%'` : ''}
        ${apartment_name ? `AND apartment_name ILIKE '%${apartment_name}%'` : ''}
        ${min_price ? `AND transaction_amount_won >= ${min_price * 10000}` : ''}
        ${max_price ? `AND transaction_amount_won <= ${max_price * 10000}` : ''}
        ${min_area ? `AND area_sqm >= ${min_area}` : ''}
        ${max_area ? `AND area_sqm <= ${max_area}` : ''}
        ${construction_year_start ? `AND construction_year >= ${construction_year_start}` : ''}
        ${construction_year_end ? `AND construction_year <= ${construction_year_end}` : ''}
        ${min_floor ? `AND floor >= ${min_floor}` : ''}
        ${max_floor ? `AND floor <= ${max_floor}` : ''}
      `

      const stats = await prisma.$queryRawUnsafe(statsQuery)

      reply.send({
        results,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        statistics: (stats as any)[0],
        filters: request.query
      })

    } catch (error) {
      fastify.log.error('Error in apartment search:', error)
      reply.status(500).send({ error: 'Search failed' })
    }
  })

  // Get unique districts for filter options
  fastify.get('/api/search/districts', async (request, reply) => {
    try {
      const districts = await prisma.$queryRaw`
        SELECT DISTINCT district_name, COUNT(*) as transaction_count
        FROM apartment_transactions 
        WHERE data_quality_score >= 80
        GROUP BY district_name
        ORDER BY transaction_count DESC
      `

      reply.send(districts)
    } catch (error) {
      fastify.log.error('Error fetching districts:', error)
      reply.status(500).send({ error: 'Failed to fetch districts' })
    }
  })

  // Get neighborhoods for a specific district
  fastify.get<{ Params: { district: string } }>('/api/search/districts/:district/neighborhoods', async (request, reply) => {
    try {
      const { district } = request.params

      const neighborhoods = await prisma.$queryRaw`
        SELECT DISTINCT dong_name, COUNT(*) as transaction_count
        FROM apartment_transactions 
        WHERE district_name ILIKE ${`%${district}%`}
        AND data_quality_score >= 80
        GROUP BY dong_name
        ORDER BY transaction_count DESC
      `

      reply.send(neighborhoods)
    } catch (error) {
      fastify.log.error('Error fetching neighborhoods:', error)
      reply.status(500).send({ error: 'Failed to fetch neighborhoods' })
    }
  })

  // Legacy search endpoint (keep for compatibility)
  fastify.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.redirect('/api/search/apartments')
  })
}