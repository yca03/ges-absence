<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260419123656 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE enseignant CHANGE uuid uuid VARCHAR(36) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_81A72FA1D17F50A6 ON enseignant (uuid)');
        $this->addSql('ALTER TABLE enseignement CHANGE uuid uuid VARCHAR(36) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BD310CCD17F50A6 ON enseignement (uuid)');
        $this->addSql('ALTER TABLE etudiant CHANGE uuid uuid VARCHAR(36) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_717E22E3D17F50A6 ON etudiant (uuid)');
        $this->addSql('ALTER TABLE filiere CHANGE uuid uuid VARCHAR(36) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2ED05D9ED17F50A6 ON filiere (uuid)');
        $this->addSql('ALTER TABLE matiere CHANGE uuid uuid VARCHAR(36) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9014574AD17F50A6 ON matiere (uuid)');
        $this->addSql('ALTER TABLE periode CHANGE uuid uuid VARCHAR(36) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_93C32DF3D17F50A6 ON periode (uuid)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_81A72FA1D17F50A6 ON enseignant');
        $this->addSql('ALTER TABLE enseignant CHANGE uuid uuid VARCHAR(255) NOT NULL');
        $this->addSql('DROP INDEX UNIQ_BD310CCD17F50A6 ON enseignement');
        $this->addSql('ALTER TABLE enseignement CHANGE uuid uuid VARCHAR(255) NOT NULL');
        $this->addSql('DROP INDEX UNIQ_717E22E3D17F50A6 ON etudiant');
        $this->addSql('ALTER TABLE etudiant CHANGE uuid uuid VARCHAR(255) NOT NULL');
        $this->addSql('DROP INDEX UNIQ_2ED05D9ED17F50A6 ON filiere');
        $this->addSql('ALTER TABLE filiere CHANGE uuid uuid VARCHAR(255) NOT NULL');
        $this->addSql('DROP INDEX UNIQ_9014574AD17F50A6 ON matiere');
        $this->addSql('ALTER TABLE matiere CHANGE uuid uuid VARCHAR(255) NOT NULL');
        $this->addSql('DROP INDEX UNIQ_93C32DF3D17F50A6 ON periode');
        $this->addSql('ALTER TABLE periode CHANGE uuid uuid VARCHAR(255) NOT NULL');
    }
}
