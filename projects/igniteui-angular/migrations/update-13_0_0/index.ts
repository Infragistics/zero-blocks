import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '13.0.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
  context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

  const update = new UpdateChanges(__dirname, host, context);
  update.applyChanges();
};
