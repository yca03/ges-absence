<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260425102859 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE presence (id INT AUTO_INCREMENT NOT NULL, date DATETIME NOT NULL, status TINYINT NOT NULL, filieres_id INT DEFAULT NULL, enseignements_id INT DEFAULT NULL, enseignants_id INT DEFAULT NULL, INDEX IDX_6977C7A5A5DB2FE8 (filieres_id), INDEX IDX_6977C7A5DCB471D6 (enseignements_id), INDEX IDX_6977C7A57CF12A69 (enseignants_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE presence ADD CONSTRAINT FK_6977C7A5A5DB2FE8 FOREIGN KEY (filieres_id) REFERENCES filiere (id)');
        $this->addSql('ALTER TABLE presence ADD CONSTRAINT FK_6977C7A5DCB471D6 FOREIGN KEY (enseignements_id) REFERENCES enseignement (id)');
        $this->addSql('ALTER TABLE presence ADD CONSTRAINT FK_6977C7A57CF12A69 FOREIGN KEY (enseignants_id) REFERENCES enseignant (id)');
        $this->addSql('ALTER TABLE etudiant ADD presence_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE etudiant ADD CONSTRAINT FK_717E22E3F328FFC4 FOREIGN KEY (presence_id) REFERENCES presence (id)');
        $this->addSql('CREATE INDEX IDX_717E22E3F328FFC4 ON etudiant (presence_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE presence DROP FOREIGN KEY FK_6977C7A5A5DB2FE8');
        $this->addSql('ALTER TABLE presence DROP FOREIGN KEY FK_6977C7A5DCB471D6');
        $this->addSql('ALTER TABLE presence DROP FOREIGN KEY FK_6977C7A57CF12A69');
        $this->addSql('DROP TABLE presence');
        $this->addSql('ALTER TABLE etudiant DROP FOREIGN KEY FK_717E22E3F328FFC4');
        $this->addSql('DROP INDEX IDX_717E22E3F328FFC4 ON etudiant');
        $this->addSql('ALTER TABLE etudiant DROP presence_id');
    }
}
