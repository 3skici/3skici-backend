const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user || user.role !== 'Admin') return res.status(403).json({ message: 'Access denied: Not an admin' });
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
