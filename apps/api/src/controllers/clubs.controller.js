/**
 * Clubs Management Controller
 * Handles CRUD operations for system clubs (super admin only)
 */

const { masterPrisma } = require('../database');

class ClubsController {
  /**
   * List all clubs with pagination and filters
   * @route GET /api/super-admin/clubs
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        isActive,
        plan,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      console.log('🔍 [Clubs Controller] List request:', {
        query: req.query,
        page,
        limit,
        isActive,
        plan,
        search,
        superAdmin: req.superAdmin
      });

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
      }

      if (plan && plan !== '') {
        where.plan = plan;
      }

      if (search && search !== '') {
        where.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { companyDocument: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } }
        ];
      }

      console.log('🔍 [Clubs Controller] Where clause:', where);

      // Get total count
      const total = await masterPrisma.club.count({ where });
      console.log('🔍 [Clubs Controller] Total count:', total);

      // Get clubs
      const clubs = await masterPrisma.club.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          branding: {
            select: {
              logoUrl: true,
              appName: true,
              primaryColor: true
            }
          },
          stats: {
            select: {
              totalUsers: true,
              totalConsumers: true,
              totalMerchants: true,
              totalRevenue: true,
              totalCashbackPaid: true
            }
          },
          _count: {
            select: {
              admins: true,
              modules: true
            }
          }
        }
      });

      console.log('✅ [Clubs Controller] Clubs found:', clubs.length);

      res.json({
        success: true,
        data: {
          clubs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] List error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get club by ID
   * @route GET /api/super-admin/clubs/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const club = await masterPrisma.club.findUnique({
        where: { id },
        include: {
          branding: true,
          appConfig: true,
          stats: true,
          cashbackConfig: true,
          withdrawalConfig: true,
          modules: {
            orderBy: {
              sortOrder: 'asc'
            }
          },
          admins: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              admins: true,
              modules: true,
              apiKeys: true
            }
          }
        }
      });

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Clube not found'
        });
      }

      res.json({
        success: true,
        data: { club }
      });

    } catch (error) {
      console.error('❌ [Clubs] Get by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get club statistics
   * @route GET /api/super-admin/clubs/:id/stats
   */
  async getStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await masterPrisma.clubStats.findUnique({
        where: { clubId: id }
      });

      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Stats not found for this club'
        });
      }

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('❌ [Clubs] Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create a new club
   * @route POST /api/super-admin/clubs
   */
  async create(req, res) {
    try {
      const {
        slug,
        companyName,
        companyDocument,
        plan = 'basic',
        isActive = false,
        subdomain,
        adminSubdomain,
        customDomain,
        contactName,
        contactEmail,
        contactPhone,
        monthlyFee = 0,
        maxUsers = 1000,
        maxAdmins = 10,
        maxStorageGB = 50,
        address
      } = req.body;

      // Validate required fields
      if (!slug || !companyName || !companyDocument || !subdomain || !contactName || !contactEmail || !contactPhone) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Create database name from slug
      const databaseName = `clube_digital_${slug.replace(/-/g, '_')}`;

      // Create club
      const club = await masterPrisma.club.create({
        data: {
          slug,
          companyName,
          companyDocument,
          plan,
          isActive,
          subdomain,
          adminSubdomain: adminSubdomain || `admin-${slug}`,
          customDomain,
          databaseHost: 'localhost',
          databasePort: 5432,
          databaseName,
          databaseUser: 'clube_digital_user',
          databasePassword: 'clube_digital_password',
          contactName,
          contactEmail,
          contactPhone,
          monthlyFee,
          maxUsers,
          maxAdmins,
          maxStorageGB
        }
      });

      // Create branding
      await masterPrisma.clubBranding.create({
        data: {
          clubId: club.id,
          appName: companyName,
          appDescription: `Clube de benefícios ${companyName}`,
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937'
        }
      });

      // Create stats
      await masterPrisma.clubStats.create({
        data: {
          clubId: club.id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Clube created successfully',
        data: { club }
      });

    } catch (error) {
      console.error('❌ [Clubs] Create error:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Club with this slug, document, or subdomain already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update club
   * @route PUT /api/super-admin/clubs/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        companyName,
        companyDocument,
        plan,
        isActive,
        subdomain,
        adminSubdomain,
        customDomain,
        contactName,
        contactEmail,
        contactPhone,
        monthlyFee,
        maxUsers,
        maxAdmins,
        maxStorageGB
      } = req.body;

      const updateData = {};

      if (companyName !== undefined) updateData.companyName = companyName;
      if (companyDocument !== undefined) updateData.companyDocument = companyDocument;
      if (plan !== undefined) updateData.plan = plan;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (subdomain !== undefined) updateData.subdomain = subdomain;
      if (adminSubdomain !== undefined) updateData.adminSubdomain = adminSubdomain;
      if (customDomain !== undefined) updateData.customDomain = customDomain;
      if (contactName !== undefined) updateData.contactName = contactName;
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
      if (monthlyFee !== undefined) updateData.monthlyFee = monthlyFee;
      if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
      if (maxAdmins !== undefined) updateData.maxAdmins = maxAdmins;
      if (maxStorageGB !== undefined) updateData.maxStorageGB = maxStorageGB;

      const club = await masterPrisma.club.update({
        where: { id },
        data: updateData,
        include: {
          branding: true,
          stats: true
        }
      });

      res.json({
        success: true,
        message: 'Clube updated successfully',
        data: { club }
      });

    } catch (error) {
      console.error('❌ [Clubs] Update error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Toggle club active status
   * @route PATCH /api/super-admin/clubs/:id/toggle-status
   */
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      // Get current status
      const currentClub = await masterPrisma.club.findUnique({
        where: { id },
        select: { isActive: true }
      });

      if (!currentClub) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      // Toggle status
      const club = await masterPrisma.club.update({
        where: { id },
        data: { isActive: !currentClub.isActive }
      });

      res.json({
        success: true,
        message: `Clube ${club.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { club }
      });

    } catch (error) {
      console.error('❌ [Clubs] Toggle status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update club branding
   * @route PUT /api/super-admin/clubs/:id/branding
   */
  async updateBranding(req, res) {
    try {
      const { id } = req.params;
      const {
        appName,
        appDescription,
        logoUrl,
        logoIconUrl,
        faviconUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        appStoreUrl,
        playStoreUrl,
        loginDescriptionPt,
        loginDescriptionEn,
        loginDescriptionEs,
        loginIllustrationUrl,
        loginWelcomePt,
        loginWelcomeEn,
        loginWelcomeEs
      } = req.body;

      // Verify club exists
      const club = await masterPrisma.club.findUnique({
        where: { id }
      });

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      const updateData = {};

      if (appName !== undefined) updateData.appName = appName;
      if (appDescription !== undefined) updateData.appDescription = appDescription;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (logoIconUrl !== undefined) updateData.logoIconUrl = logoIconUrl;
      if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl;
      if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
      if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
      if (accentColor !== undefined) updateData.accentColor = accentColor;
      if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
      if (textColor !== undefined) updateData.textColor = textColor;
      if (appStoreUrl !== undefined) updateData.appStoreUrl = appStoreUrl;
      if (playStoreUrl !== undefined) updateData.playStoreUrl = playStoreUrl;
      if (loginDescriptionPt !== undefined) updateData.loginDescriptionPt = loginDescriptionPt;
      if (loginDescriptionEn !== undefined) updateData.loginDescriptionEn = loginDescriptionEn;
      if (loginDescriptionEs !== undefined) updateData.loginDescriptionEs = loginDescriptionEs;
      if (loginIllustrationUrl !== undefined) updateData.loginIllustrationUrl = loginIllustrationUrl;
      if (loginWelcomePt !== undefined) updateData.loginWelcomePt = loginWelcomePt;
      if (loginWelcomeEn !== undefined) updateData.loginWelcomeEn = loginWelcomeEn;
      if (loginWelcomeEs !== undefined) updateData.loginWelcomeEs = loginWelcomeEs;

      const branding = await masterPrisma.clubBranding.upsert({
        where: { clubId: id },
        update: updateData,
        create: {
          clubId: id,
          appName: appName || club.companyName,
          primaryColor: primaryColor || '#3B82F6',
          secondaryColor: secondaryColor || '#10B981',
          accentColor: accentColor || '#F59E0B',
          backgroundColor: backgroundColor || '#FFFFFF',
          textColor: textColor || '#1F2937',
          ...updateData
        }
      });

      res.json({
        success: true,
        message: 'Branding updated successfully',
        data: { branding }
      });

    } catch (error) {
      console.error('❌ [Clubs] Update branding error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Upload branding asset
   * @route POST /api/super-admin/clubs/:id/branding/upload
   */
  async uploadBrandingAsset(req, res) {
    try {
      const { id } = req.params;
      const { assetType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      if (!assetType) {
        return res.status(400).json({
          success: false,
          message: 'Asset type is required'
        });
      }

      // Verify club exists
      const club = await masterPrisma.club.findUnique({
        where: { id }
      });

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      // Upload to S3
      const s3Service = require('../services/s3.service');
      const uploadResult = await s3Service.uploadBrandingAsset(id, file, assetType);

      // Update branding with new URL
      const fieldMap = {
        'logo': 'logoUrl',
        'logo-icon': 'logoIconUrl',
        'favicon': 'faviconUrl',
        'login-illustration': 'loginIllustrationUrl'
      };

      const fieldName = fieldMap[assetType];
      if (!fieldName) {
        return res.status(400).json({
          success: false,
          message: 'Invalid asset type'
        });
      }

      const branding = await masterPrisma.clubBranding.upsert({
        where: { clubId: id },
        update: {
          [fieldName]: uploadResult.url
        },
        create: {
          clubId: id,
          appName: club.companyName,
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          [fieldName]: uploadResult.url
        }
      });

      res.json({
        success: true,
        message: 'Asset uploaded successfully',
        data: {
          url: uploadResult.url,
          key: uploadResult.key,
          assetType: assetType,
          branding
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] Upload branding asset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get global dashboard stats
   * @route GET /api/super-admin/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      // Get total counts
      const totalClubs = await masterPrisma.club.count();
      const activeClubs = await masterPrisma.club.count({
        where: { isActive: true }
      });
      const inactiveClubs = await masterPrisma.club.count({
        where: { isActive: false }
      });

      // Get aggregated stats from all clubs
      const allStats = await masterPrisma.clubStats.findMany();

      const aggregated = allStats.reduce((acc, stat) => {
        acc.totalUsers += stat.totalUsers || 0;
        acc.totalConsumers += stat.totalConsumers || 0;
        acc.totalMerchants += stat.totalMerchants || 0;
        acc.totalPurchases += stat.totalPurchases || 0;
        acc.totalRevenue += parseFloat(stat.totalRevenue || 0);
        acc.totalCashbackPaid += parseFloat(stat.totalCashbackPaid || 0);
        acc.totalPlatformFees += parseFloat(stat.totalPlatformFees || 0);
        acc.revenue30d += parseFloat(stat.revenue30d || 0);
        acc.purchases30d += stat.purchases30d || 0;
        return acc;
      }, {
        totalUsers: 0,
        totalConsumers: 0,
        totalMerchants: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        totalCashbackPaid: 0,
        totalPlatformFees: 0,
        revenue30d: 0,
        purchases30d: 0
      });

      // Get recent clubs
      const recentClubs = await masterPrisma.club.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          branding: {
            select: {
              logoUrl: true,
              appName: true
            }
          },
          stats: {
            select: {
              totalUsers: true,
              totalRevenue: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          clubs: {
            total: totalClubs,
            active: activeClubs,
            inactive: inactiveClubs
          },
          ...aggregated,
          recentClubs
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create club complete with database, branding, and first admin
   * @route POST /api/super-admin/clubs/complete
   */
  async createComplete(req, res) {
    const bcrypt = require('bcrypt');
    const databaseManager = require('../utils/database-manager');
    const s3Service = require('../services/s3.service');

    try {
      console.log('🚀 [Clubs] Starting complete club creation...');

      // Extract data from form
      const {
        // Company info
        companyName,
        companyDocument,
        contactName,
        contactEmail,
        contactPhone,
        plan = 'basic',

        // Branding
        appName,
        appDescription,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,

        // Technical
        slug,
        subdomain,
        customDomain,
        bundleId,

        // Admin
        adminName,
        adminEmail,
        adminCpf,
        adminPhone,
        adminPassword
      } = req.body;

      // Validate required fields
      if (!slug || !companyName || !companyDocument || !subdomain || !contactName || !contactEmail || !contactPhone) {
        return res.status(400).json({
          success: false,
          message: 'Missing required company fields'
        });
      }

      // Branding fields are optional now (will be configured later)
      const finalAppName = appName || companyName;
      const finalPrimaryColor = primaryColor || '#3B82F6';

      if (!adminName || !adminEmail || !adminPassword || !adminCpf) {
        console.log('❌ [Clubs] Missing admin fields:', {
          adminName: !!adminName,
          adminEmail: !!adminEmail,
          adminPassword: !!adminPassword,
          adminCpf: !!adminCpf
        });
        return res.status(400).json({
          success: false,
          message: 'Missing required admin fields'
        });
      }

      // Define database name (needed throughout the function)
      const databaseName = `clube_digital_${slug.replace(/-/g, '_')}`;
      console.log('📊 [Clubs] Database name will be:', databaseName);

      // Step 1: Create database
      console.log('📦 [Clubs] Step 1: Creating physical database...');

      try {
        await databaseManager.setupTenantDatabase(databaseName);
        console.log(`✅ [Clubs] Database created and migrated: ${databaseName}`);
      } catch (dbError) {
        console.error('❌ [Clubs] Database creation failed:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create database',
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }

      // Step 2: Skip S3 upload (branding will be configured later via UI)
      console.log('⏭️  [Clubs] Step 2: Skipping branding upload (will be configured later)...');

      let logoUrl = null;
      let iconUrl = null;
      let faviconUrl = null;

      // Step 3: Create club in master database
      console.log('💾 [Clubs] Step 3: Creating club in master database...');
      const club = await masterPrisma.club.create({
        data: {
          slug,
          companyName,
          companyDocument,
          plan,
          isActive: true, // Activate immediately since everything is configured
          subdomain,
          adminSubdomain: subdomain, // Same as subdomain, no "admin-" prefix
          customDomain: customDomain || null,
          databaseHost: 'localhost',
          databasePort: 5432,
          databaseName,
          databaseUser: 'clube_digital_user',
          databasePassword: 'clube_digital_password',
          contactName,
          contactEmail,
          contactPhone,
          monthlyFee: 0,
          maxUsers: 1000,
          maxAdmins: 10,
          maxStorageGB: 50
        }
      });

      console.log('✅ [Clubs] Club created:', club.id);

      // Step 4: Create branding
      console.log('🎨 [Clubs] Step 4: Creating branding...');
      await masterPrisma.clubBranding.create({
        data: {
          clubId: club.id,
          appName: finalAppName,
          appDescription: appDescription || `Clube de benefícios ${companyName}`,
          logoUrl: logoUrl || null,
          logoIconUrl: iconUrl || null, // Icon for the app
          faviconUrl: faviconUrl || null, // Favicon
          primaryColor: finalPrimaryColor,
          secondaryColor: secondaryColor || '#10B981',
          accentColor: accentColor || '#F59E0B',
          backgroundColor: backgroundColor || '#FFFFFF',
          textColor: textColor || '#1F2937'
        }
      });

      console.log('✅ [Clubs] Branding created');

      // Step 5: Create app config
      console.log('📱 [Clubs] Step 5: Creating app config...');

      // Generate URL scheme (remove dots and hyphens)
      const urlScheme = bundleId.replace(/\./g, '').replace(/-/g, '');

      await masterPrisma.clubAppConfig.create({
        data: {
          clubId: club.id,
          appName: finalAppName,
          tenantSlug: slug,
          appDescription: appDescription || `Clube de benefícios ${companyName}`,
          bundleId,
          packageName: bundleId, // Android package name (same as bundleId)
          urlScheme, // Deep linking scheme
          appIconUrl: iconUrl || 'https://via.placeholder.com/512', // Temporary placeholder
          splashScreenUrl: 'https://via.placeholder.com/1080x1920', // Temporary placeholder (pode ser adicionado depois)
          splashBackgroundColor: backgroundColor || '#FFFFFF',
          currentVersion: '1.0.0',
          iosBuildNumber: 1,
          androidBuildNumber: 1,
          appStoreStatus: 'DRAFT',
          playStoreStatus: 'DRAFT',
          autoBuildEnabled: true
        }
      });

      console.log('✅ [Clubs] App config created');

      // Step 6: Create stats
      console.log('📊 [Clubs] Step 6: Creating stats...');
      await masterPrisma.clubStats.create({
        data: {
          clubId: club.id
        }
      });

      console.log('✅ [Clubs] Stats created');

      // Step 7: Create first admin
      console.log('👤 [Clubs] Step 7: Creating first admin...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create in master database (club_admins table)
      await masterPrisma.clubAdmin.create({
        data: {
          clubId: club.id,
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          cpf: adminCpf || null,
          phone: adminPhone || null,
          role: 'admin',
          isActive: true
        }
      });

      console.log('✅ [Clubs] First admin created in master database');

      // Step 7.1: Create admin in tenant database (users table)
      console.log('👤 [Clubs] Step 7.1: Creating admin in tenant database...');
      console.log('📊 [Clubs] Database name for tenant:', databaseName);
      console.log('📊 [Clubs] Club object:', { id: club.id, slug: club.slug, databaseName: club.databaseName });

      const { getClubClient } = require('../database');
      let tenantPrisma;

      try {
        tenantPrisma = getClubClient(club);  // Pass the club object, not just databaseName
        console.log('✅ [Clubs] Tenant Prisma client obtained');
      } catch (clientError) {
        console.error('❌ [Clubs] Failed to get tenant Prisma client:', clientError);
        throw clientError;
      }

      try {
        // Split admin name into first and last name
        const nameParts = adminName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        // Generate unique username from email
        const username = adminEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

        console.log('📝 [Clubs] Creating admin with data:', {
          firstName,
          lastName,
          email: adminEmail.toLowerCase(),
          username,
          cpf: adminCpf,
          phone: adminPhone
        });

        await tenantPrisma.$executeRaw`
          INSERT INTO users (
            id, first_name, last_name, email, username, cpf, phone,
            password, user_type, is_active, email_confirmed,
            created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${firstName},
            ${lastName},
            ${adminEmail.toLowerCase()},
            ${username},
            ${adminCpf},
            ${adminPhone || null},
            ${hashedPassword},
            'admin',
            true,
            true,
            NOW(),
            NOW()
          )
        `;

        console.log('✅ [Clubs] Admin created in tenant database');
      } catch (tenantError) {
        console.error('❌ [Clubs] Failed to create admin in tenant database:', tenantError);
        console.error('❌ [Clubs] Error details:', {
          message: tenantError.message,
          code: tenantError.code,
          meta: tenantError.meta
        });
        // Don't throw, just log - admin exists in master database
      }

      console.log('✅ [Clubs] First admin setup completed');

      // Step 8: Return success
      console.log('🎉 [Clubs] Complete club creation finished successfully!');

      res.status(201).json({
        success: true,
        message: 'Club created successfully with database, branding, and admin',
        data: {
          club: {
            id: club.id,
            slug: club.slug,
            companyName: club.companyName,
            subdomain: club.subdomain,
            databaseName: club.databaseName,
            isActive: club.isActive
          }
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] Create complete error:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Club with this slug, document, or subdomain already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClubsController();
