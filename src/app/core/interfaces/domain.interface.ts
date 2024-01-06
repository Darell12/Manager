export interface IDomain {
  url: string;
  name: string;
}

export type FilterType = 'active' | 'expired' | 'all';

export interface ISsl {
    version:           string;
    app:               string;
    host:              string;
    response_time_sec: string;
    result:            IDetailSsl;
}

export interface IDetailSsl {
    host:                 string;
    resolved_ip:          string;
    issued_to:            string;
    issued_o:             null;
    issuer_c:             string;
    issuer_o:             string;
    issuer_ou:            null;
    issuer_cn:            string;
    cert_sn:              string;
    cert_sha1:            string;
    cert_alg:             string;
    cert_ver:             number;
    cert_sans:            string;
    cert_exp:             boolean;
    cert_valid:           boolean;
    valid_from:           string;
    valid_till:           string;
    validity_days:        number;
    days_left:            number;
    valid_days_to_expire: number;
    hsts_header_enabled:  boolean;
}
