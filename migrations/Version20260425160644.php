<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260425160644 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE justifications (id INT AUTO_INCREMENT NOT NULL, motif VARCHAR(255) NOT NULL, document_justificatif VARCHAR(255) NOT NULL, statut VARCHAR(255) NOT NULL, date_depot DATETIME NOT NULL, date_traitement DATETIME NOT NULL, presences_id INT DEFAULT NULL, etudiants_id INT DEFAULT NULL, INDEX IDX_BAF963207B8B9373 (presences_id), INDEX IDX_BAF96320A873A5C6 (etudiants_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE justifications ADD CONSTRAINT FK_BAF963207B8B9373 FOREIGN KEY (presences_id) REFERENCES presence (id)');
        $this->addSql('ALTER TABLE justifications ADD CONSTRAINT FK_BAF96320A873A5C6 FOREIGN KEY (etudiants_id) REFERENCES etudiant (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE justifications DROP FOREIGN KEY FK_BAF963207B8B9373');
        $this->addSql('ALTER TABLE justifications DROP FOREIGN KEY FK_BAF96320A873A5C6');
        $this->addSql('DROP TABLE justifications');
    }
}
