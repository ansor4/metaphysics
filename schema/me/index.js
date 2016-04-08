import date from '../fields/date';
import gravity from '../../lib/loaders/gravity';
import Bidders from './bidders';
import BidderPositions from './bidder_positions';
import SaleRegistrations from './sale_registrations';
import HomePageModules from './home_page_modules';
import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

const Me = new GraphQLObjectType({
  name: 'Me',
  fields: {
    id: {
      type: GraphQLString,
    },
    created_at: date,
    email: {
      type: GraphQLString,
    },
    bidders: Bidders,
    bidder_positions: BidderPositions,
    sale_registrations: SaleRegistrations,
    home_page_modules: HomePageModules,
  },
});

export default {
  type: Me,
  resolve: (root, options, { rootValue: { accessToken } }) =>
    gravity.with(accessToken)('me'),
};
