import gql from "lib/gql"
import { GraphQLSchema } from "graphql"

export const causalityStitchingEnvironment = ({
  causalitySchema,
  localSchema,
}: {
  causalitySchema: GraphQLSchema & { transforms: any }
  localSchema: GraphQLSchema
}) => {
  return {
    extensionSchema: gql`
      extend type Me {
        auctionsLotStandingConnection(
          first: Int
          last: Int
          after: String
          before: String
        ): AuctionsLotStandingConnection!
      }

      extend type AuctionsLotStanding {
        saleArtwork: SaleArtwork
      }
    `,

    resolvers: {
      AuctionsLotStanding: {
        saleArtwork: {
          fragment: gql`
            fragment AuctionsLotStandingSaleArtwork on AuctionsLotStanding {
              lot {
                internalID
              }
            }
          `,
          resolve: (parent, _args, context, info) => {
            return info.mergeInfo.delegateToSchema({
              schema: localSchema,
              operation: "query",
              fieldName: "saleArtwork",
              args: { id: parent.lot.internalID },
              transforms: causalitySchema.transforms,
              context,
              info,
            })
          },
        },
      },
      Me: {
        auctionsLotStandingConnection: {
          // The required query to get access to the object, e.g. we have to
          // request `id` on a Me in order to access the user's lot standings
          fragment: gql`
            fragment MeLotStandings on Me {
              internalID
            }
          `,
          // The function to handle getting the lot standings correctly, we
          // use the root query `auctionsLotStandings` to grab the data from the local
          // metaphysics schema
          resolve: (parent, args, context, info) => {
            return info.mergeInfo.delegateToSchema({
              schema: causalitySchema,
              operation: "query",
              fieldName: "_unused_auctionsLotStandingConnection",
              args: {
                ...args,
                userId: parent.internalID,
              },
              context,
              info,
            })
          },
        },
      },
    },
  }
}
