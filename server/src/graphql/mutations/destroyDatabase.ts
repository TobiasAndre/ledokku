import { MutationResolvers } from '../../generated/graphql';
import { prisma } from '../../prisma';
import { dokku } from '../../lib/dokku';
import { sshConnect } from '../../lib/ssh';

export const destroyDatabase: MutationResolvers['destroyDatabase'] = async (
  _,
  { input },
  { userId }
) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { databaseId } = input;

  // We find database to delete
  const databaseToDelete = await prisma.database.findOne({
    where: {
      id: databaseId,
    },
  });

  if (!databaseToDelete) {
    throw new Error(`Database with id : ${databaseId} was not found`);
  }

  const ssh = await sshConnect();

  const result = await dokku.postgres.destroy(ssh, databaseToDelete.name);

  // We delete the database
  await prisma.database.delete({
    where: {
      id: databaseId,
    },
  });

  return { result };
};