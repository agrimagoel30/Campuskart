class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // The Mongoose query object (e.g. Product.find())
    this.queryString = queryString; // The req.query object (e.g. { category: 'Books', price[lte]: 500 })
  }

  filter() {
    const queryObj = { ...this.queryString };
    // Remove specific fields that are not meant for raw MongoDB filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    // Converts e.g. { price: { lte: '500' } } to { price: { $lte: '500' } } for MongoDB
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search() {
    // Requires a text index on the model (e.g., title and description)
    if (this.queryString.search) {
      this.query = this.query.find({
        title: {
          $regex: this.queryString.search,
          $options: 'i'
        }
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // Support sorting by multiple fields (e.g. sort=price,createdAt -> 'price createdAt')
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by newest
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    // e.g. page=3&limit=10 => skip 20 results, take 10
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
