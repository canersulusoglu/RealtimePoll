import { withFilter } from 'graphql-subscriptions';

module.exports = {
    Query: {
        polls: async (_, { itemPerPage, pageNumber }, { db: { Polls } }) => {
            var polls = await Polls.find().sort({createdAt: -1}).skip((pageNumber - 1) * itemPerPage).limit(itemPerPage * 1);
            var totalCount = await Polls.estimatedDocumentCount();
            return {
                polls,
                totalCount
            }
        },
        poll: async (_, { id }, { db : { Polls } }) => await Polls.findById(id)
    },
    Mutation: {
        createPoll: async (_, { title, options }, { db : { Polls }, pubsub }) => {
            var createdPoll : any = await Polls.create({
                title: title,
                options: options
            })
            // Publish events
            pubsub.publish("POLL_CREATED", { pollCreated: createdPoll});
            return createdPoll;
        },
        votePoll: async (_, { pollId, optionId }, { db : { Polls }, pubsub }) => {
            var updatedOption = await Polls.findOneAndUpdate({'_id': pollId, 'options._id': optionId},{$inc: {'options.$.count': 1}}, { new: true })
            var newOption = {
                _id: updatedOption._id,
                option: updatedOption.options.find(x => x._id == optionId)
            };
            // Publish events
            pubsub.publish("POLL_VOTED", { pollVoted: newOption})
            return true;
        }
    },
    Subscription: {
        pollCreated: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("POLL_CREATED") 
        },
        pollVoted: {
            subscribe: withFilter(
                (_, __, { pubsub }) => pubsub.asyncIterator("POLL_VOTED"),
                (payload, variables) => {
                    return variables.pollId ? (variables.pollId === payload.pollVoted._id) : true
                }
            )
        }
    }
}