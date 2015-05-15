/**
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 * 
 *  This file is part of opendispatcher
 *  
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global exports, global */

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

exports.getVersion = function (req, res) {
    var query_str = 'select updated from current.update_info where dataset=$1';
    global.bag.query(query_str, ['nwb'],
            function (err, result) {
                if (err) {
                    res.status(400).json(err);
                } else {
                    for (index = 0; index < result.rows.length; ++index) {
                    }
                    res.json(result.rows);
                }
                return;
            }
    );
};

exports.getHectometer = function (req, res) {
    if (req.query) {
        id = req.params.id;
        srid = req.query.srid;
        if (!srid) {
            srid = 4326;
        }
        var query_str = 'select a.openbareruimtenaam, a.huisnummer, a.huisletter, a.huisnummertoevoeging, a.postcode, a.woonplaatsnaam, ' +
                'a.gemeentenaam, a.provincienaam, a.typeadresseerbaarobject, a.adresseerbaarobject, a.nummeraanduiding, a.nevenadres, ' +
                'st_asgeojson(st_force2d(st_transform(a.geopunt,$2))) geopunt, vp.gerelateerdpand as pand ' +
                'from bag_actueel.adres a left join bag_actueel.verblijfsobjectpand vp on a.adresseerbaarobject = vp.identificatie ' +
                'where a.adresseerbaarobject = $1';
        global.bag.query(query_str, [id, srid],
                function (err, result) {
                    if (err) {
                        res.status(400).json(err);
                    } else {
                        for (index = 0; index < result.rows.length; ++index) {
                            var geometry = JSON.parse(result.rows[index].geopunt);
                            delete result.rows[index].geopunt;
                            result.rows[index].geometry = geometry;
                            result.rows[index].type = "Feature";
                            result.rows[index].properties = {};
                            result.rows[index].properties.gid = result.rows[index].nummeraanduiding;
                            result.rows[index].properties.nummeraanduiding = result.rows[index].nummeraanduiding;
                            delete result.rows[index].nummeraanduiding;
                            result.rows[index].properties.openbareruimtenaam = result.rows[index].openbareruimtenaam;
                            delete result.rows[index].openbareruimtenaam;
                            result.rows[index].properties.pand = result.rows[index].pand;
                            delete result.rows[index].pand;
                            result.rows[index].properties.huisnummer = result.rows[index].huisnummer;
                            delete result.rows[index].huisnummer;
                            result.rows[index].properties.huisletter = result.rows[index].huisletter;
                            delete result.rows[index].huisletter;
                            result.rows[index].properties.huisnummertoevoeging = result.rows[index].huisnummertoevoeging;
                            delete result.rows[index].huisnummertoevoeging;
                            result.rows[index].properties.postcode = result.rows[index].postcode;
                            delete result.rows[index].postcode;
                            result.rows[index].properties.woonplaatsnaam = result.rows[index].woonplaatsnaam;
                            delete result.rows[index].woonplaatsnaam;
                            result.rows[index].properties.gemeentenaam = result.rows[index].gemeentenaam;
                            delete result.rows[index].gemeentenaam;
                            result.rows[index].properties.provincienaam = result.rows[index].provincienaam;
                            delete result.rows[index].provincienaam;
                            result.rows[index].properties.typeadresseerbaarobject = result.rows[index].typeadresseerbaarobject;
                            delete result.rows[index].typeadresseerbaarobject;
                            result.rows[index].properties.adresseerbaarobject = result.rows[index].adresseerbaarobject;
                            delete result.rows[index].adresseerbaarobject;
                            result.rows[index].properties.nevenadres = result.rows[index].nevenadres;
                            delete result.rows[index].nevenadres;
                        }
                        res.json({"type": "FeatureCollection", "features": result.rows});
                    }
                    return;
                }
        );
    }
};

exports.autoComplete = function (req, res) {
    // @todo Check to see if the database is up. If not, fall back to nominatim!
    if (global.infra) {
        if (req.query) {
            console.log('infrastructure.autocomplete');
            searchtype = req.params.searchtype.toLowerCase();
            if (searchtype !== 'autoweg' &&
                    searchtype !== 'spoorweg' &&
                    searchtype !== 'vaarweg') {
                searchtype = 'autoweg';
            }
            searchphrase = req.params.searchphrase;
            if (searchphrase.length > 1) {
                srid = req.query.srid;
                if (!srid) {
                    srid = 4326;
                }

                whereclause = "(search_val @@ to_tsquery('dutch',$1)) ";
                finalsearch = searchphrase.trim().toProperCase().replace(/ /g, "&");

                var query_str = "select source, val as display_name, " +
                        "st_x(st_transform(st_centroid(st_collect(the_geom)),$2)) as lon, " +
                        "st_y(st_transform(st_centroid(st_collect(the_geom)),$2)) as lat " +
                        "from current.search_infra where " +
                        whereclause + ' and source=$3 ' +
                        "group by source, val limit 10";
                global.infra.query(query_str, [finalsearch, srid, searchtype],
                        function (err, result) {
                            if (err) {
                                res.status(400).json(err);
                            } else {
                                res.json(result.rows);
                            }
                            return;
                        });
            } else {
                return res.json([]);
            }
        }
    } else {
        res.status(400).json({"err": -1, "message": "infrastructure is not implemented"});
    }
};