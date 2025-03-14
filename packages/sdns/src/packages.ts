/*
 Copyright (c) 2025 Arcadia

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

namespace sdns {

    /**
     * @description - The definition of an address. 
     *
     * @param seg1 - The first segment of the address
     * @param seg2 - The second segment of the address
     * @param seg3 - The third segment of the address
     * @param seg4 - The fourth segment of the address
    */
    class Address {
        seg1: number;
        seg2: number;
        seg3: number;
        seg4: number;

        constructor(seg1: number, seg2: number, seg3: number, seg4: number) {
            this.seg1 = seg1;
            this.seg2 = seg2;
            this.seg3 = seg3;
            this.seg4 = seg4;
        }

        toDecStr(): string {
            return `${this.seg1}.${this.seg2}.${this.seg3}.${this.seg4}`;
        }

        toHexStr(): string {
            return `${this.seg1.toString(16)}:${this.seg2.toString(16)}:${this.seg3.toString(16)}:${this.seg4.toString(16)}`;
        }
    };

    /**
     * @description - The package types for a SDNS package
     * 
     * @param DISCOVERY - The package is a discovery package
     * @param OFFER - The package is an offer package
     * @param REQUEST - The package is a request package
     * @param ACK - The package is an acknowledgement package
     * @param NACK - The package is a non-acknowledgement package
     */
    export enum PackageType {
        DISCOVERY = "DISCOVERY",
        OFFER = "OFFER",
        REQUEST = "REQUEST",
        ACK = "ACK",
        NACK = "NACK"
    };

    /**
     * @description - The base package interface
     * 
     * @param type - The type of the package
     * @param client_id - The id of the client
     * @param server_id - (optional) The id of the server
     */
    export interface Package {
        type: string;
        client_id: string;
        server_id: string | null;
    };

    /**
     * @description - The discovery package interface
     * 
     * @param desired_prefix_length - The desired prefix length of the client
     */
    export interface DiscoveryPackage extends Package {
        desired_prefix_length: number;
    };

    /**
     * @description - The offer package interface
     * 
     * @param offered_address - The offered address
     * @param prefix_length - The prefix length
     * @param lease_time - The lease time in seconds
     */
    export interface OfferPackage extends Package{
        offered_address: Address;
        prefix_length: number;
        lease_time: number;
    };

    /**
     * @description - The request package interface
     * 
     * @param assigned_address - The assigned address
     * @param prefix_length - The prefix length
     */
    export interface RequestPackage extends Package{
        assigned_address: Address;
        prefix_length: number;
    };

    /**
     * @description - The acknowledgement package interface
     * 
     * @param assigned_address - The assigned address
     * @param prefix_length - The prefix length of the Networkmask
     * @param lease_time - The lease time in seconds
     */
    export interface AckPackage extends Package{
        assigned_address: Address;
        prefix_length: number;
        lease_time: number;
    };
};