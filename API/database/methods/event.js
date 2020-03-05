const mongoose = require('mongoose');
const eventSchema = require('../schemas/event');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get event by ID
 *
 * (required) id: event ID
 *
 * Return an event - Promise<Event>
 */
eventSchema.statics.getEventByID = function(id) {
  return this.model('Event')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get events (All events if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of events - Promise<Array<Events>>
 */
eventSchema.statics.getEvents = function(condition, limit) {
  return this.model('Event')
    .find(condition)
    .limit(limit)
    .exec();
};

/**
 * Get events order by creation date - descending (All events if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of events - Promise<Array<Events>>
 */
eventSchema.statics.getEventsOrderByDesc = function(condition, limit) {
  return this.model('Event')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

/**
 * Get events in array of placeIDs order by creation date - descending
 *
 * (required) ids: array of placeIDs
 * (optional) limit: Number
 *
 * Return array of events - Promise<Array<Events>>
 */
eventSchema.statics.getEventsIn = function(ids, limit) {
  return this.model('Event')
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
 * Create an event
 *
 * (required) authorID: Author ID
 * (required) placeID: Place ID
 * (required) title: text
 * (required) content: text
 * (required) start: number (timestamp ms)
 * (required) end: number (timestamp ms)
 *
 * Return created event - Promise<Event>
 */
eventSchema.statics.createEvent = function(event) {
  return this.model('Event').create({
    authorID: event.authorID,
    placeID: event.placeID,
    title: event.title,
    content: event.content,
    start: event.start,
    end: event.end,
    medias: [],
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit event that match with the condition
 *
 * (required) id: Event ID
 * (required) document: Object like {content: 'new content'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
eventSchema.statics.editEventByID = function(id, document, options) {
  return this.model('Event')
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
 * Delete event by id
 *
 * (required) id: Event ID
 *
 * Return Promise<CommandResult>
 */
eventSchema.statics.deleteEventByID = function(id) {
  return this.model('Event')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete events (All events if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
eventSchema.statics.deleteEvents = function(condition) {
  return this.model('Event')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('Event', eventSchema);
