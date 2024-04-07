const redisClient = require('../redis')
const Product = require('../models/ProductModel');

const calculateTotalPrice = async (items) => {
    try {
        let totalValue = 0;

        const getProductPrice = async (productId) => {
            try {
                // Check if the product price is cached in Redis
                const cachedPrice = await redisClient.get(`product:${productId}:price`);

                if (cachedPrice !== null) {
                    // If the price is cached, return it
                    console.log('Cache hit for product:', productId);
                    return parseFloat(cachedPrice);
                } else {
                    // If the price is not cached, fetch the product from the database
                    console.log('Cache miss for product:', productId);
                    const product = await Product.findById(productId);

                    if (product) {
                        // If the product is found in the database, cache its price in Redis
                        await redisClient.set(`product:${productId}:price`, product.price);
                        return product.price;
                    } else {

                        return null;
                    }
                }
            } catch (error) {

                console.error('Error getting product price:', error);
                throw error;
            }
        };

        for (const item of items) {

            const productPrice = await getProductPrice(item.productId);

            if (productPrice !== null) {
                totalValue += productPrice * item.quantity;
            }
        }

        return totalValue;
    } catch (error) {
        console.error('Error calculating total value:', error);
        throw error;
    }
};



const generateUniqueOTP = (length = 6) => {
    const chars = '0123456789'; // Define the character set for OTP
    let otp = '';

    // Generate random OTP (5 digits)
    for (let i = 0; i < length - 1; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        otp += chars[randomIndex];
    }

    // Append single digit from timestamp to ensure 6 digits
    const timestamp = Date.now();
    otp += timestamp.toString().slice(-1); // Append the last digit of the timestamp

    return otp;
}


module.exports = { calculateTotalPrice, generateUniqueOTP };
