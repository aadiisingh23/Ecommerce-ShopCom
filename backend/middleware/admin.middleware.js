

const admin = async (req,res,next) => {
    try {
        if(req.user && req.user.role === "admin"){
            next();
        } else {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error." });
    }
}

export default admin;