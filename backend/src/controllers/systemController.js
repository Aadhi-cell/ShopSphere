class SystemController {
    getRoot = async (_req, res) => {
        try {
            res.json({
                message: 'Backend API is running',
                endpoints: {
                    health: '/health',
                    products: '/api/products',
                    login: 'POST /api/login',
                    register: 'POST /api/register',
                    adminProducts: 'CRUD /api/admin/products',
                },
                frontend: 'Please access the frontend at http://localhost:5173',
            });
        } catch (err) {
            console.error('getRoot error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    getHealth = async (_req, res) => {
        try {
            res.json({ status: 'ok' });
        } catch (err) {
            console.error('getHealth error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    getVersion = async (_req, res) => {
        try {
            res.json({ version: '1.0.1-fix-applied', port: process.env.PORT || 5000 });
        } catch (err) {
            console.error('getVersion error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}

module.exports = new SystemController();
