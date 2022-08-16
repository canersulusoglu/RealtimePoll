import { gql } from '@apollo/client'

export const GET_POOLS = gql`
    query Polls($itemPerPage: Int!, $pageNumber: Int!) {
        polls(itemPerPage: $itemPerPage, pageNumber: $pageNumber) {
            totalCount
            polls {
                _id
                title
                createdAt
            }
        }
    }
`;

export const GET_POOL = gql`
    query Poll($pollId: ID!) {
        poll(id: $pollId) {
            _id
            title
            options {
                _id
                name
                count
            }
        }
    }
`;

export const CREATE_POOL = gql`
    mutation CreatePoll($title: String!, $options: [OptionInput!]!) {
        createPoll(title: $title, options: $options) {
            _id
        }
    }
`;

export const VOTE_POOL = gql`
    mutation VotePoll($pollId: ID!, $optionId: ID!) {
        votePoll(pollId: $pollId, optionId: $optionId)
    }
`;

export const SUBSCRIPTION_POOL_CREATED = gql`
    subscription PollCreated {
        pollCreated {
            _id
            title
        }
    }
`;

export const SUBSCRIPTION_POOL_VOTED = gql`
    subscription PollVoted($pollId: ID!) {
        pollVoted(pollId: $pollId) {
            _id
            option {
                _id
                count
            }
        }
    }
`;