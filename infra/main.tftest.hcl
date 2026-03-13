# テストファイル: `main.tftest.hcl`
# 各 run ブロックは terraform plan 出力を検証し、
# リソース設定が期待通りかを確認します。
# 目的は基本的なネットワーク構成やデータベース設定に
# 関する安全弾を仕込むことです。

# VPC の CIDRが正しいか検証
# - ネットワークサイズが `10.0.0.0/16` であること
run "vpc_cidr_validation" {
  command = plan

  assert {
    condition     = aws_vpc.main.cidr_block == "10.0.0.0/16"
    error_message = "VPC CIDR must be 10.0.0.0/16"
  }
}

# サブネットのCIDRが `10.0.1.0/24` であることを確認
run "subnet_cidr_validation" {
  command = plan

  assert {
    condition     = aws_subnet.public.cidr_block == "10.0.1.0/24"
    error_message = "Subnet CIDR must be 10.0.1.0/24"
  }
}

# RDSインスタンスが予想されるクラス (`db.t3.micro`) かどうか
run "rds_instance_class_validation" {
  command = plan

  assert {
    condition     = aws_db_instance.postgres.instance_class == "db.t3.micro"
    error_message = "RDS instance class must be db.t3.micro"
  }
}

# DB名が `memoapp` と設定されているかチェック
run "rds_db_name_validation" {
  command = plan

  assert {
    condition     = aws_db_instance.postgres.db_name == "memoapp"
    error_message = "Database name must be memoapp"
  }
}

# RDSエンジンが `postgres` を使用していること
run "rds_engine_validation" {
  command = plan

  assert {
    condition     = aws_db_instance.postgres.engine == "postgres"
    error_message = "Database engine must be postgres"
  }
}

# VPCに付与されたNameタグが `memo-app-vpc` であるか確認
run "vpc_tags_validation" {
  command = plan

  assert {
    condition     = aws_vpc.main.tags["Name"] == "memo-app-vpc"
    error_message = "VPC Name tag must be memo-app-vpc"
  }
}

# RDS用セキュリティグループにingressルールが少なくとも1つ存在すること
run "security_group_ingress_validation" {
  command = plan

  assert {
    condition     = length(aws_security_group.rds.ingress) > 0
    error_message = "Security group must have at least one ingress rule"
  }
}

# セキュリティグループのいずれかのingressルールがポート5432になっているか確認
# ingress は set なのでインデックス指定は使えません。
run "security_group_postgres_port_validation" {
  command = plan

  assert {
    condition = anytrue([for rule in aws_security_group.rds.ingress : rule.from_port == 5432])
    error_message = "Security group ingress port must include 5432"
  }
}