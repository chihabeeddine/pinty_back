const mongoose = require('mongoose');
const newsSchema = require('../schemas/news');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get news by ID
 *
 * (required) id: news ID
 *
 * Return a news - Promise<News>
 */
newsSchema.statics.getNewsByID = function(id) {
  return this.model('News')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get news (All news if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of news - Promise<Array<News>>
 */
newsSchema.statics.getNews = function(condition, limit) {
  return this.model('News')
    .find(condition)
    .limit(limit)
    .exec();
};

/**
 * Get news order by creation date - descending (All news if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of news - Promise<Array<News>>
 */
newsSchema.statics.getNewsOrderByDesc = function(condition, limit) {
  return this.model('News')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

/**
 * Get news in array of placeIDs order by creation date - descending
 *
 * (required) ids: array of placeIDs
 * (optional) limit: Number
 *
 * Return array of news - Promise<Array<News>>
 */
newsSchema.statics.getNewsIn = function(ids, limit) {
  return this.model('News')
    .find({
      placeID: {
        $in: ids,
      },
    })
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create a news
 *
 * (required) authorID: Author ID
 * (required) placeID: Place ID
 * (required) title: text
 * (required) content: text
 *
 * Return created news - Promise<News>
 */
newsSchema.statics.createNews = function(news) {
  return this.model('News').create({
    authorID: news.authorID,
    placeID: news.placeID,
    title: news.title,
    content: news.content,
    medias: [],
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit news that match with the condition
 *
 * (required) id: News ID
 * (required) document: Object like {content: 'new content'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
newsSchema.statics.editNewsByID = function(id, document, options) {
  return this.model('News')
    .update(
      {
        _id: id,
      },
      document,
      options,
    )
    .exec();
};

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

/**
 * Delete news by id
 *
 * (required) id: News ID
 *
 * Return Promise<CommandResult>
 */
newsSchema.statics.deleteNewsByID = function(id) {
  return this.model('News')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete news (All news if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
newsSchema.statics.deleteNews = function(condition) {
  return this.model('News')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('News', newsSchema);
