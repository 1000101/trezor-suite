import versionUtils from 'utils/version';

const findNextBootloader = (list, bootloaderVersion) => list
    .reverse()
    .find(item => versionUtils.isNewerOrEqual(item.min_bootloader_version, bootloaderVersion));

const filterBootloader = (list, bootloaderVersion) => list
    .filter(item => versionUtils.isEqual(item.min_bootloader_version, bootloaderVersion));

const findNextFirmware = (list, firmwareVersion) => list
    .reverse()
    .find(item => versionUtils.isNewerOrEqual(item.min_firmware_version, firmwareVersion));

const filterFirmware = (list, firmwareVersion) => list
    .filter(item => versionUtils.isEqual(item.min_firmware_version, firmwareVersion));

export {
    findNextBootloader,
    findNextFirmware,
    filterBootloader,
    filterFirmware,
};
