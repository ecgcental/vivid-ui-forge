
import { VITAsset } from "@/lib/types";

type AssetInfoCardProps = {
  asset: VITAsset;
  getRegionName: (id: string) => string;
  getDistrictName: (id: string) => string;
};

export const AssetInfoCard = ({ asset, getRegionName, getDistrictName }: AssetInfoCardProps) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Asset Information</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
            <p className="text-base">{asset.serialNumber}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type of Unit</p>
            <p className="text-base">{asset.typeOfUnit}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Voltage Level</p>
            <p className="text-base">{asset.voltageLevel}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Region</p>
            <p className="text-base">{getRegionName(asset.regionId)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">District</p>
            <p className="text-base">{getDistrictName(asset.districtId)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Location</p>
            <p className="text-base">{asset.location}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">GPS Coordinates</p>
            <p className="text-base">{asset.gpsCoordinates}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-base">{asset.status}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Protection</p>
            <p className="text-base">{asset.protection}</p>
          </div>
        </div>
        
        {asset.photoUrl && (
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Asset Photo</p>
            <img 
              src={asset.photoUrl} 
              alt={`${asset.typeOfUnit} - ${asset.serialNumber}`}
              className="w-full h-auto rounded-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};
