import versionUtils from 'utils/version';

export const getItemFromList = (list, version) => list.find(item => versionUtils.toString(item.version) === versionUtils.toString(version));
